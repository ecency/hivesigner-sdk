export interface Operation {
    0: string;
    1: {
        [key: string]: any;
    };
}
export interface Transaction {
    ref_block_num: number;
    ref_block_prefix: number;
    expiration: string;
    operations: Operation[];
    extensions: any[];
}
