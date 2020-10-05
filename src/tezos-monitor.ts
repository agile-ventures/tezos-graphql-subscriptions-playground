import fetch from 'node-fetch';
import { Observable, Subject } from 'rxjs';
import { URL } from 'url';

export interface MonitorBlockHeader {
    hash: string;
    level: number;
    proto: number;
    predecessor: string;
    timestamp: string;
    validation_pass: number;
    operations_hash: string;
    fitness: string[];
    context: string;
    protocol_data: string;
}

enum TezosMonitorState {
    Inactive,
    Connecting,
    Running,
}

export class TezosMonitor {
    private readonly url: string;
    private readonly subject = new Subject<MonitorBlockHeader>();
    private state = TezosMonitorState.Inactive;
    private lastError: any;

    constructor(tezosNodeUrl: string) {
        this.url = new URL('/monitor/heads/main', tezosNodeUrl).toString();
    }

    get blockHeaders(): Observable<MonitorBlockHeader> {
        return this.subject;
    }

    start(): void {
        if (this.state !== TezosMonitorState.Inactive) {
            console.log('Tezos monitor is already started.');
            return;
        }

        console.log(`Starting Tezos monitor for new blocks at: ${this.url}`);
        void this.establishConnection(); // B/c it's infinite promise
    }

    stop(): void {
        console.log('Stopping Tezos monitor for new blocks.');
        this.state = TezosMonitorState.Inactive;
    }

    private async establishConnection() {
        this.state = TezosMonitorState.Connecting;
        while (<any>this.state !== TezosMonitorState.Inactive) {
            try {
                this.state = TezosMonitorState.Connecting;
                let response = await fetch(this.url);
                if (response.status !== 200) {
                    throw new Error(`Failed to connect ${response.status} ${response.statusText}`);
                }

                console.log('Established connection to Tezos monitor.');
                this.state = TezosMonitorState.Running;

                for await (let chunk of response.body) {
                    let dataStr = typeof chunk !== 'string' ? chunk.toString() : chunk;
                    let blockHeader = <MonitorBlockHeader>JSON.parse(dataStr);

                    console.log('Tezos monitor is pushing a new block.', blockHeader);
                    this.subject.next(blockHeader);

                    if (<any>this.state === TezosMonitorState.Inactive) {
                        return;
                    }
                }
            } catch (err) {
                this.lastError = err;
                console.error('Failed listening to Tezos monitor. Will reconnect.', this.url, err);
            }
        }
    }
}
