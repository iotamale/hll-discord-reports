import 'winston';

declare module 'winston' {
    interface Logger {
        useraction: LeveledLogMethod;
    }
}