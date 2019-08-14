import { IMeasurement } from "./IMeasurement";
import { VarTime } from "../variable_time/VariableTime";
import { ITslpDataPoint, ITimePeriod, TslpDataPointQuality } from "../components/ITimeSeriesLinePlot";
export class Periodicity implements ITimePeriod {
    years = 0;
    months = 0;
    days = 0;
    hrs = 0;
    mins = 0;
    secs = 60;
    millis = 0;
    static getSeconds(per: Periodicity): number {
        return per.years * 365 * 30 * 24 * 60 * 60 + per.months * 30 * 24 * 60 * 60 + per.days * 24 * 60 * 60 + per.hrs * 60 * 60 + per.mins * 60 + per.secs + per.millis * 0.001;
    }
}

export enum FetchStrategy {
    Raw = "raw",
    Snap = "snap",
    Average = "average",
    Max = "max",
    Min = "min",
    Interpolated = "interpolated",
}

export interface IScadaMeasurement extends IMeasurement {
    fetch_strategy: FetchStrategy,
    periodicity: Periodicity,
};

export class ScadaMeasurement implements IScadaMeasurement {
    static typename: string = "ScadaMeasurement"
    discriminator: string = ScadaMeasurement.typename;
    meas_id: string | number = "WRLDCMP.SCADA1.A0015067";
    fetch_strategy: FetchStrategy = FetchStrategy.Snap;
    periodicity: Periodicity = new Periodicity();
}
