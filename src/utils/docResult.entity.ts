import { Section } from "../sections/entities/sections.entity";


export class DocResult {
    public id?: string;
    public name?: string;
    public ebookEarnings?: number
    public courseEarnings?: number
    public totalEarnings?: number
    public email?: string
    public fullName?: string
    public securityAnswer?: string
    public tags?: string[]
    public title?: string
    public description?: string
    public publisher?: string
    public price?: number
    public sections?: Section[]
    public releaseDate?: Date
    public instructorList?: string[]
    public language?: string
    public offersCertificate?: boolean
    public salesCount?: number
    public titlePage?: string
    public active?: boolean
    public userEmails?: string[]

   
}