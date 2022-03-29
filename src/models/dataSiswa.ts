
import mongoose, { Document, Model } from 'mongoose'
import enumValues from '../helpers/enumValues'

export enum Kelas {
    X = 10,
    XI = 11,
    XII = 12
}

export enum kelasString {
    X = 'X',
    XI = 'XI',
    XII = 'XII'
}

export enum Jurusan {
    RPL = 'RPL',
    TKJ = 'TKJ',
    TKR = 'TKR',
    TAB = 'TAB',
    TAV = 'TAV',
    TITL = 'TITL',
    DPIB = 'DPIB'
}

export interface DataSiswa {
    nis: string,
    namaLengkap: string,
    kelas: number,
    kelasString: kelasString,
    kelasNo: number,
    jurusan: Jurusan
}



export interface DataSiswaMethods {
    getFullClass: () => string,
    getDataSiswa: () => DataSiswa
}

export type DocumentBaseDataSiswa = Document & DataSiswa & DataSiswaMethods;

export interface SiswaModel extends Model<DataSiswa, {}, DataSiswaMethods> {
    createSiswa: (siswa: Omit<DataSiswa, 'kelasString'>) => Promise<DocumentBaseDataSiswa>,
    findSiswaByNis: (nis: string) => Promise<DocumentBaseDataSiswa>
}

const generateKelasString = function (kelas: Kelas) {
    switch (kelas) {
        case Kelas.X:
            return kelasString.X
        case Kelas.XI:
            return kelasString.XI
        case Kelas.XII:
            return kelasString.XII
    }
}


const siswaSchema = new mongoose.Schema<DataSiswa, {}, DataSiswaMethods>({
    nis: {
        type: String,
        required: [true, 'NIS Harus Diisi'],
        unique: true,
        maxlength: 100
    },
    namaLengkap: {
        type: String,
        required: [true, 'Nama Lengkap Harus Diisi'],
        maxlength: 100
    },
    kelas: {
        type: Number,
        enum: Kelas,
        required: [true, 'Kelas Harus Diisi']
    },
    kelasString: {
        type: String,
        enum: kelasString,
        required: true,
        default: function (this: DataSiswa) {
            return generateKelasString(this.kelas)
        }
    },
    kelasNo: {
        type: Number,
        required: [true, 'Nomor Kelas Harus Diisi']
    },
    jurusan: {
        type: String,
        required: [true, 'Jurusan Harus Diisi'],
        enum: { values: enumValues(Jurusan), message: 'Jurusan Tidak Valid' }
    }
})

siswaSchema.statics.createSiswa = async function (this: SiswaModel, siswa: Omit<DataSiswa, 'kelasString'>) {
    const { nis, namaLengkap, kelas, kelasNo, jurusan } = siswa || null

    try {
        const siswaDocument = new this({ nis, namaLengkap, kelas, kelasNo, jurusan })
        await siswaDocument.save()
        return siswaDocument
    } catch (err) {
        console.log(err);


    }
}

siswaSchema.methods.getFullClass = function (this: DataSiswa) {
    if (this.kelasNo === Kelas.X) {
        const fullClass = `${this.kelasString} - ${this.jurusan}`
        return fullClass
    } else {
        const fullClass = `${this.kelasString} - ${this.jurusan} ${this.kelasNo}`
        return fullClass
    }
}

siswaSchema.methods.getDataSiswa = function (this: DocumentBaseDataSiswa) {
    const dataSiswaObject: DataSiswa = {
        nis: this.nis,
        namaLengkap: this.namaLengkap,
        kelas: this.kelas,
        kelasNo: this.kelasNo,
        kelasString: this.kelasString,
        jurusan: this.jurusan
    }

    return dataSiswaObject
}

siswaSchema.pre('save', function (next) {
    if (this.isModified('kelas')) {
        this.kelasString = generateKelasString(this.kelas)
    }

    next()
})

const SiswaModel = mongoose.model<DataSiswa, SiswaModel>('siswa', siswaSchema, 'siswa_data')

export default SiswaModel
