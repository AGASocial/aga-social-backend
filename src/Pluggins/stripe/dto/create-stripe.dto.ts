import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateStripeDto {
    paymentMethodId: string;
    uid: string;
    items: Array<Plugin>
    receipt_email: string;
    currency: string;
    allowed_domain: string;

}

export interface Plugin {
    description: string;
    price: number;
    interval: Interval;
    _id: string;
    name: string;

}
type Interval = 'day' | 'month' | 'week' | 'year';



export default CreateStripeDto; 