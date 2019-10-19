/**
 * Timeseries line plot component that takes in timeseries data
 */
import React, { Component } from 'react';
import './TimeSeriesLinePlot.css';
import { ITslpProps, ITslpState, ITslpDataPoint, IFrame, TslpProps, TimePeriod, TslpSeriesStyle } from "./ITimeSeriesLinePlot";
import Plot from 'react-plotly.js';
import { Data, Datum, Config, Layout } from 'plotly.js';
import { Color } from 'plotly.js';
import { IDashWidgetContent } from './IDashWidgetContent';

class TimeSeriesLinePlot extends Component<ITslpProps, ITslpState> implements IDashWidgetContent {
    static defaultProps: ITslpProps = {
        discriminator: TslpProps.typename,
        border: '1px solid lightgray',
        backgroundColor: 'white',
        titleColor: 'black',
        seriesList: [],
        title: 'Default Title',
    };

    state = {
        backgroundColor: this.props.backgroundColor,
        seriesList: this.props.seriesList,
        titleColor: this.props.titleColor,
        mounted: false,
        title: this.props.title,
    };

    componentDidMount() {
        this.setState({ mounted: true } as ITslpState);
    }

    generateSeriesData(seriesIter: number): Data {
        let series_data_template: Data = { name: this.state.seriesList[seriesIter].title, x: [], y: [], type: this.state.seriesList[seriesIter].renderStrategy, mode: 'lines', line: { color: 'red' as Color, width: 2 } }
        let seriesData: Data = { ...series_data_template };
        seriesData.line.color = this.state.seriesList[seriesIter].color;
        seriesData.line.width = this.state.seriesList[seriesIter].size;

        // determine series data display time shift
        let shiftMillis: number = 0;
        const seriesStyle = this.state.seriesList[seriesIter].seriesStyle;
        if (seriesStyle != TslpSeriesStyle.duration) {
            shiftMillis = 1000 * TimePeriod.getSeconds(this.state.seriesList[seriesIter].displayTimeShift);
        }

        // get points from measurement
        for (let pntIter = 0; pntIter < this.state.seriesList[seriesIter].points.length; pntIter++) {
            const dataPnt = this.state.seriesList[seriesIter].points[pntIter];
            let xVal: Datum = dataPnt.timestamp;
            if (seriesStyle != TslpSeriesStyle.duration) {
                xVal = new Date(dataPnt.timestamp + shiftMillis);
            }
            (seriesData.x as Datum[]).push(xVal);
            (seriesData.y as Datum[]).push(dataPnt.value);
        }
        return seriesData;
    }

    generatePlotData() {
        let plot_data = []
        for (let seriesIter = 0; seriesIter < this.state.seriesList.length; seriesIter++) {
            plot_data.push(this.generateSeriesData(seriesIter));
        }
        return plot_data;
    }

    async fetchAndSetPntData(): Promise<boolean> {
        // fetch the timeseries data
        for (let seriesIter = 0; seriesIter < this.state.seriesList.length; seriesIter++) {
            const series = this.state.seriesList[seriesIter];
            const pnts: ITslpDataPoint[] = [];
            this.state.seriesList[seriesIter].points = pnts;
        }
        return true;
    }

    // type definitions at https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react-plotly.js/index.d.ts
    render() {
        // this.fetchAndSetPntData();
        let plot_data: Data[] = this.generatePlotData();
        let plot_layout: Partial<Layout> = {
            autosize: true,
            paper_bgcolor: this.state.backgroundColor,
            plot_bgcolor: this.state.backgroundColor,
            legend: {
                orientation: "h"
            },
            title: {
                text: this.state.title,
                font: {
                    color: this.state.titleColor
                }
            },
            xaxis: {
                tickfont: {
                    color: this.state.titleColor
                }
            },
            yaxis: {
                tickfont: {
                    color: this.state.titleColor
                }
            }
        };
        let plot_frames: IFrame[] = [];
        let plot_config: Partial<Config> = {};

        return (
            <Plot
                data={plot_data}
                layout={plot_layout}
                frames={plot_frames}
                config={plot_config}
                style={{ width: '100%', height: '100%' }}
            />
        );
    }
}

export default TimeSeriesLinePlot;