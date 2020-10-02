import fetch from 'node-fetch';
import { URL } from 'url';

import { TezosPubSub } from './tezos-pub-sub';
import { MonitorBlockHeader } from './monitor-block-header';

enum TezosMonitorState {
    Inactive,
    Connecting,
    Running,
}

/** Monitors Tezos node for new blocks. Then publishes a new header to PubSub. */
export class TezosMonitor {
    private readonly url: string;
    private state = TezosMonitorState.Inactive;
    public error: Error | null = null;

    constructor(
        tezosNodeUrl: string,
        private readonly pubSub: TezosPubSub
    ) {
        this.url = new URL('/monitor/heads/main', tezosNodeUrl).toString();
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
                this.error = null;

                for await (let chunk of response.body) {
                    let dataStr = typeof chunk !== 'string' ? chunk.toString() : chunk;
                    let blockHeader = <MonitorBlockHeader>JSON.parse(dataStr);

                    console.log('Tezos monitor is pushing a new block.', blockHeader);
                    this.pubSub.monitorBlockHeaders.publish(blockHeader);

                    if (<any>this.state === TezosMonitorState.Inactive) {
                        return;
                    }
                }
            } catch (err) {
                this.error = err;
                console.error('Failed listening to Tezos monitor. Will reconnect.', this.url, err);
            }
        }
    }
}
