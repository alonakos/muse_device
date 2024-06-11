import React from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const COLORS = [
    "#66D7D1",
    "#403D58",
    "#DBD56E",
    "#FC7753"
];


// https://coolors.co/aa9774-fc7753-66d7d1-403d58-dbd56e

export interface IPlotProps<T> {
    data: T[];
    minValue: number;
    maxValue: number;
    width: number;
    height: number;
}

export class Plot<T> extends React.Component<IPlotProps<T>> {
    render() {
        return (
                <LineChart
                    width={this.props.width}
                    height={this.props.height}
                    data={this.props.data}
                    style={{ margin: "0 auto" }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[this.props.minValue, this.props.maxValue]} />
                    <Tooltip />
                    <Legend />
                    {this.renderLines()}
                </LineChart>
        );
    }

    private renderLines = () => {
        if (this.props.data.length < 1) {
            return null;
        }
        return Object.keys(this.props.data[0]).map((key, index) => {
            return (
                <Line
                    type="monotone"
                    dataKey={key}
                    stroke={COLORS[index]}
                    strokeWidth={5}
                    dot={false}
                    isAnimationActive={false}
                />
            );
        })
    }
}
