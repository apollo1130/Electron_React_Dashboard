import { VarTime } from "../variable_time/VariableTime";
import { ITslpDataPoint, TslpDataPointQuality } from "../components/ITimeSeriesLinePlot";
import { IScadaMeasurement, FetchStrategy, Periodicity } from "../measurements/ScadaMeasurement";
import { ITslpDataFetcher } from "./IFetcher";
export class ScadaTslpFetcher implements ITslpDataFetcher {
    serverBaseAddress: string;
    getJSON(options) {
        return new Promise((resolve, reject) => {
            console.log('rest::getJSON');
            let output = '';
            const http = require('http');
            const req = http.request(options, (res) => {
                console.log(`${options.hostname} : ${res.statusCode}`);
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    output += chunk;
                });
                res.on('end', () => {
                    let obj = JSON.parse(output);
                    resolve({ statusCode: res.statusCode, json: obj });
                });
            });
            req.on('error', (err) => {
                // res.send('error: ' + err.message);
                reject(err);
            });
            req.end();
        });
    };

    ensureTwoDigits(num: number): string {
        if (num >= 0 && num <= 9) {
            return "0" + num;
        }
        return "" + num;
    };

    getApiTimeString(timeObj: Date): string {
        // "dd/MM/yyyy/HH:mm:ss"
        let timeStr = `${this.ensureTwoDigits(timeObj.getDate())}/${this.ensureTwoDigits(timeObj.getMonth())}/${timeObj.getFullYear()}/${this.ensureTwoDigits(timeObj.getHours())}:${this.ensureTwoDigits(timeObj.getMinutes())}:${this.ensureTwoDigits(timeObj.getSeconds())}`;
        return timeStr;
    };

    createApiFetchPath(pnt: string | number, fetch_strategy: FetchStrategy, periodicity: Periodicity, fromTime: Date, toTime: Date): string {
        var fromTimeStr = this.getApiTimeString(fromTime);
        var toTimeStr = this.getApiTimeString(toTime);
        var secs = Periodicity.getSeconds(periodicity);
        var url = "";
        // api/values/history?type=snap&pnt=something&strtime=30/11/2016/00:00:00&endtime=30/11/2016/23:59:00&secs=60
        url = `/api/values/history?type=${fetch_strategy}&pnt=${pnt}&strtime=${fromTimeStr}&endtime=${toTimeStr}&secs=${secs}`;
        return url;
    };

    async fetchServerData(pnt: string | number, fetch_strategy: FetchStrategy, periodicity: Periodicity, fromVarTime: VarTime, toVarTime: VarTime): Promise<ITslpDataPoint[]> {
        let resultData: ITslpDataPoint[] = [];
        let serverBaseAddress: string = this.serverBaseAddress;
        const fromTime: Date = VarTime.getDateObj(fromVarTime);
        const toTime: Date = VarTime.getDateObj(toVarTime);
        // do the api call to service
        let fetchPath = this.createApiFetchPath(pnt, fetch_strategy, periodicity, fromTime, toTime);
        const options = {
            hostname: serverBaseAddress,
            port: 62448,
            path: fetchPath,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        try {
            let pointsArray = await this.getJSON(options);
            for (var i = 0; i < pointsArray['json'].length; i++) {
                const val = pointsArray['json'][i].dval;
                const timstamp = pointsArray['json'][i].timestamp;
                const quality: string = pointsArray['json'][i].status;
                let pntQuality: TslpDataPointQuality = TslpDataPointQuality.Good;
                if (quality.toLowerCase() != "good" || quality.toLowerCase() != "ok") {
                    pntQuality = TslpDataPointQuality.Bad;
                }
                let dataPnt: ITslpDataPoint = { timestamp: timstamp, value: parseInt(val), quality: pntQuality };
                resultData.push(dataPnt);
            }
        }
        catch (err) {
            console.log(`${err.message}`);
            resultData = [];
        }
        return resultData;
    };

    async fetchData(fromVarTime: VarTime, toVarTime: VarTime, scada_meas: IScadaMeasurement): Promise<ITslpDataPoint[]> {
        let resultData: ITslpDataPoint[] = await this.fetchServerData(scada_meas.meas_id, scada_meas.fetch_strategy, scada_meas.periodicity, fromVarTime, toVarTime);
        return resultData;
    }
}
