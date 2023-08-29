import { Injectable } from '@nestjs/common';
import { Vimeo } from '@vimeo/vimeo';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();



@Injectable()
export class VimeoService {
    private client: Vimeo;

    constructor() {
        try {
            console.log("Initializing Vimeo service...");

            const clientId = process.env.VIMEO_CLIENT_ID;
            const clientSecret = process.env.VIMEO_CLIENT_SECRET;
            const accessToken = process.env.VIMEO_ACCESS_TOKEN;

            if (!clientId || !clientSecret || !accessToken) {
                throw new Error("Vimeo credentials are missing.");
            }


            this.client = new Vimeo(clientId, clientSecret, accessToken);
            console.log("Vimeo client initialized.");
        } catch (error) {
            console.error("Error initializing Vimeo service:", error);
        }
    }





    async uploadVideo(fileBuffer: Buffer, videoName: string): Promise<string | null> {
        try {
            console.log("Uploading video to Vimeo...");

            const tempDirectory = 'C:/vimeotemp/';
            const tempFileName = 'tempVideo.mp4';
            const tempFilePath = `${tempDirectory}${tempFileName}`;

            fs.writeFileSync(tempFilePath, fileBuffer);

            const uploadResponse = await this.client.upload(
                tempFilePath,
                {
                    'name': videoName,
                    'privacy': {
                        'view': 'anybody'
                    }
                },
                (bytesUploaded: number, bytesTotal: number) => {
                    const percentComplete = (bytesUploaded / bytesTotal) * 100;
                    console.log(`Uploading: ${percentComplete.toFixed(2)}%`);
                }
            );

            fs.unlinkSync(tempFilePath);


            if (uploadResponse) {
                const vimeoBaseUrl = "https://vimeo.com";
                const videoLink = `${vimeoBaseUrl}${uploadResponse.replace('videos/', '')}?share=copy`; 
                console.log("Video uploaded successfully. This is the link:", videoLink);
                return videoLink;
            } else {
                console.error("Error in video upload response:", uploadResponse);
                return null;
            }
        } catch (error) {
            console.error("Error uploading video:", error);
            return null;
        }
    }



    async uploadAudio(fileBuffer: Buffer, audioName: string): Promise<string | null> {
        try {
            console.log("Uploading audio to Vimeo...");

            const tempDirectory = 'C:/vimeotemp/';
            const tempFileName = 'tempAudio.mp3'; 
            const tempFilePath = `${tempDirectory}${tempFileName}`;

            fs.writeFileSync(tempFilePath, fileBuffer);

            const uploadResponse = await this.client.upload(
                tempFilePath,
                {
                    'name': audioName,
                    'privacy': {
                        'view': 'anybody'
                    }
                },
                (bytesUploaded: number, bytesTotal: number) => {
                    const percentComplete = (bytesUploaded / bytesTotal) * 100;
                    console.log(`Uploading: ${percentComplete.toFixed(2)}%`);
                }
            );

            fs.unlinkSync(tempFilePath);


            if (uploadResponse) {
                const vimeoBaseUrl = "https://vimeo.com";
                const audioLink = `${vimeoBaseUrl}${uploadResponse.replace('videos/', '')}?share=copy`;                console.log("Audio uploaded successfully. This is the link:", audioLink);
                return audioLink;
            } else {
                console.error("Error in audio upload response:", uploadResponse);
                return null;
            }
        } catch (error) {
            console.error("Error uploading audio:", error);
            return null;
        }
    }







   
}

