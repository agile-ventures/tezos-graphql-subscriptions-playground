import { PubSub } from 'graphql-yoga';
import { BlockResponse } from '@taquito/rpc';

import { MonitorBlockHeader } from './monitor-block-header';

/** Strongly-typed PubSub for particular payload. */
export class TezosPubSubEvents<TPayload> {
    public readonly asyncIterator: AsyncIterator<TPayload>;

    constructor(
        private readonly trigger: string,
        private readonly pubSub: PubSub
    ) {
        this.asyncIterator = pubSub.asyncIterator(trigger);
    }

    publish(payload: TPayload): void {
        this.pubSub.publish(this.trigger, payload);
    }

    subscribe(onMessage: (payload: TPayload) => void): void {
        this.pubSub.subscribe(this.trigger,  onMessage);
    }
}

/** Strongly-typed PubSub. */
export class TezosPubSub {
    public readonly monitorBlockHeaders: TezosPubSubEvents<MonitorBlockHeader>;
    public readonly block: TezosPubSubEvents<BlockResponse>;

    constructor(pubSub: PubSub) {
        this.monitorBlockHeaders = new TezosPubSubEvents('MONITOR_BLOCK_HEADER', pubSub);
        this.block = new TezosPubSubEvents('BLOCK', pubSub);
    }
}
