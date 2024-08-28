import {useEffect, useContext} from 'react';
import QRCode from "react-qr-code";

export default function qrCode(){
    return(
        <div>
            <div className="flex flex-col items-center justify-start min-h-full">
            <h1>Escanea el codigo QR</h1>
            <br />
            <QRCode value="hey" />
            </div>
        </div>
    )
}