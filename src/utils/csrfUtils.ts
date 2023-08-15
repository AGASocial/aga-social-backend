import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid'; 

export function generateToken(res: Response, req: Request): string {
    const csrfToken = uuidv4(); 

    return csrfToken;
}
