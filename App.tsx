import React from 'react';
import logo from './logo.svg';
import './App.css';
import 'normalize.css/normalize.css'

import { Classes, Button, Intent, Slider } from "@blueprintjs/core";
import { Plot } from "./Plot";
// import { SMALL } from '@blueprintjs/core/lib/esm/common/classes';
// import _ from "lodash";

const WINDOW_SIZE = 200;

//https://coolors.co/aa9774-fc7753-66d7d1-403d58-dbd56e

// const buttonStyle = {
//     margin: '5px 5px 5px 5px',
//     border: '1px solid black',
//     display: 'center',
//     width: '100px',
//   };


interface IEEGPoint {
    a: number,
    b: number,
    c: number,
    d: number
}

interface IState {
    data: IEEGPoint[];
    showBlink: boolean;
    offset: number;
}

class App extends React.Component<{}, IState> {
    private reqInterval: NodeJS.Timeout | undefined = undefined;

    constructor(props: any) {
        super(props);

        this.state = {
            data: [],
            showBlink: false,
            offset: 0
        };
    }

    // private triggerBlink = _.throttle(() => {

    // }, 100);

    componentDidUpdate() {
        if (this.state.data.length < 30 || this.state.showBlink) {
            return;
        }
        let hasBlink: boolean = false;
        for (let i = this.state.data.length - 20; i < this.state.data.length; i++) {
            if (this.state.data[i].d < 750) {
                hasBlink = true;
                break;
            }
        }
        if (hasBlink) {
            this.setState({ showBlink: true });
            setTimeout(() => {
                this.setState({ showBlink: false });
            }, 600);
        }
    }

    componentWillUnmount() {
        if (this.reqInterval !== undefined) {
            clearInterval(this.reqInterval);
        }
    }

    render() {
        return (
            <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "center", height: "100%", width: "100%" }}>
                    <div style={{ flex: 1}}>
                        <Plot data={this.getData()} minValue={650} maxValue={950} width={1000} height={600} />
                    </div>
                    {this.state.showBlink &&
                        <div style={{ flex: 1, fontSize: 20 }}>Blink!</div>
                    }
                </div>
                {this.isNotPolling() &&
                    <div style={{ width: "70%" }}>
                        <Slider
                            min={0}
                            max={this.state.data.length - WINDOW_SIZE}
                            stepSize={1}
                            labelStepSize={1000}
                            value={this.state.offset}
                            onChange={o => this.setState({ offset: o })}
                        />
                    </div>
                }
                <Button 
                    //className="bp3-button" 
                    type="button"
                    intent={this.isNotPolling() ? Intent.PRIMARY : Intent.DANGER }
                    text={this.isNotPolling() ? "Start" : "Stop"}
                    // style = {buttonStyle}
                    onClick={this.startOrStopPolling}
                />
            </div>
        );
    }

    private isNotPolling = () => {
        return this.reqInterval === undefined;
    };

    private startOrStopPolling = () => {
        if (this.isNotPolling()) {
            this.setState({ data: [] });
            this.reqInterval = setInterval(async () => {
                const res = await fetch("http://localhost:5000", {
                    method: 'GET',
                    headers: {'Content-Type':'application/json'},
                });

                const arrayData = await res.json();
                console.info(arrayData.length);
                const data: IEEGPoint[] = [];
                for (const [a, b, c, d] of (arrayData as [number, number, number, number][])) {
                    data.push({ a, b, c, d })
                }

                // console.info("Got data");

                // BAD PRACTICE!!! DONT MUTATE STATE DIRECTLY
                this.state.data.push(...data);
                this.setState({ offset: this.state.data.length - WINDOW_SIZE });
                // this.forceUpdate();

            }, 100);
        } else {
            if (this.reqInterval !== undefined) {
                clearInterval(this.reqInterval);
                this.reqInterval = undefined;
                this.forceUpdate();
            }
        }
    };

    private getData = () => {
        return this.state.data.slice(this.state.offset, this.state.offset + WINDOW_SIZE);
    };
}

export default App;
