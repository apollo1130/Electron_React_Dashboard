import { Color, Datum, Data, Layout } from "plotly.js";
import { IMeasurement } from "../measurements/IMeasurement";
import { VarTime } from './../variable_time/VariableTime';
import { IDashWidgetContentState, IDashWidgetContentProps } from "./IDashWidgetContent";

export interface ITslpProps extends IDashWidgetContentProps {
    seriesList: ITslpSeriesProps[],
    backgroundColor?: Color,
    title: string
}

export class TslpProps implements ITslpProps {
    static typename: string = 'TslpProps';
    discriminator: string = TslpProps.typename;
    seriesList: ITslpSeriesProps[] = [];
    backgroundColor?: Color;
    title: string = "Default Title";
}

export interface ITslpState extends IDashWidgetContentState {
    seriesList: ITslpSeriesState[],
    backgroundColor?: Color,
    title: string,
    mounted: boolean
}

export interface ITslpSeriesState extends ITslpSeriesProps {

}

export interface ITslpSeriesProps {
    color: Color,
    meas: IMeasurement,
    fromVarTime: VarTime,
    toVarTime: VarTime,
    displayTimeShift: ITimePeriod,
    points: ITslpDataPoint[]
}

export interface ITslpDataPoint {
    timestamp: number,
    value: number,
    quality?: TslpDataPointQuality
}

export enum TslpDataPointQuality {
    Good = 1,
    Bad,
    Suspect,
    Replaced,
}

export interface ITimePeriod {
    years: number,
    months: number,
    days: number,
    hrs: number,
    mins: number,
    secs: number,
    millis: number
}

export class TimePeriod implements ITimePeriod {
    years: number = 0;
    months: number = 0;
    days: number = 0;
    hrs: number = 0;
    mins: number = 0;
    secs: number = 0;
    millis: number = 0;
    static getSeconds(per: ITimePeriod): number {
        return per.years * 365 * 30 * 24 * 60 * 60 + per.months * 30 * 24 * 60 * 60 + per.days * 24 * 60 * 60 + per.hrs * 60 * 60 + per.mins * 60 + per.secs + per.millis * 0.001;
    }
}

export class DisplayTimeShift implements ITimePeriod {
    years = 0;
    months = 0;
    days = 0;
    hrs = 0;
    mins = 0;
    secs = 0;
    millis = 0;
}

export interface IFrame {
    name: string;
    data: [{ x: Datum, y: Datum }];
    group: 'lower' | 'upper';
}

export interface IFigure {
    data: Data[];
    layout: Partial<Layout>;
}