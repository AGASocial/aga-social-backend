import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

export function transformTimestamp(timestamp: any): string {
    if (timestamp && typeof timestamp === 'object' && timestamp.seconds && timestamp.nanoseconds) {
        const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);

        const year = date.getUTCFullYear();
        const month = ('0' + (date.getUTCMonth() + 1)).slice(-2);
        const day = ('0' + date.getUTCDate()).slice(-2);
        const hours = ('0' + date.getUTCHours()).slice(-2);
        const minutes = ('0' + date.getUTCMinutes()).slice(-2);
        const seconds = ('0' + date.getUTCSeconds()).slice(-2);

        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        return formattedDate;
    }
    return '';
}


export function convertFirestoreTimestamp(timestamp: Timestamp): string {
    if (timestamp && timestamp.seconds) {
        const date = new Date(timestamp.seconds * 1000);
        const year = date.getUTCFullYear();
        const month = ('0' + (date.getUTCMonth() + 1)).slice(-2);
        const day = ('0' + date.getUTCDate()).slice(-2);
        const hours = ('0' + date.getUTCHours()).slice(-2);
        const minutes = ('0' + date.getUTCMinutes()).slice(-2);
        const seconds = ('0' + date.getUTCSeconds()).slice(-2);

        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        return formattedDate;
    }
    return '';
}
