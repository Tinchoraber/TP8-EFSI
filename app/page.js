"use client";
// app/page.js
import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './page.module.css'; // Asegúrate de que este archivo esté en la misma carpeta

export default function Page() {
    const [paises, setPaises] = useState([]);
    const [paisElegidoRandom, setPaisElegidoRandom] = useState(null);
    const [respuestaPersona, setRespuestaPersona] = useState('');
    const [puntos, setPuntos] = useState(0);
    const [temporizador, setTemporizador] = useState(15);
    const [nombrePersona, setNombrePersona] = useState('');
    const [tablaDePuntos, setTablaDePuntos] = useState([]);
    const [pistas, setPistas] = useState(0);

    useEffect(() => {
        async function getPaises() {
            const respuesta = await fetch('https://countriesnow.space/api/v0.1/countries/flag/images');
            const data = await respuesta.json();
            setPaises(data.data);
            elegirPaisRandom(data.data);
        }
        getPaises();
    }, []);

    useEffect(() => {
        if (temporizador === 0) {
            setPuntos(puntos - 1);
            elegirPaisRandom(paises);
        } else {
            const cuentaRegresiva = setTimeout(() => setTemporizador(temporizador - 1), 1000);
            return () => clearTimeout(cuentaRegresiva);
        }
    }, [temporizador]);

    useEffect(() => {
        const puntuacionesGuardadas = JSON.parse(localStorage.getItem('tablaPuntos')) || [];
        setTablaDePuntos(puntuacionesGuardadas);
    }, []);

    const elegirPaisRandom = (paises) => {
        const numeroAleatorio = Math.floor(Math.random() * paises.length);
        setPaisElegidoRandom(paises[numeroAleatorio]);
    }

    const adivino = () => {
        if (respuestaPersona.toLowerCase() === paisElegidoRandom.name.toLowerCase()) {
            setPuntos(puntos + 10);
            elegirPaisRandom(paises);
        } else {
            setPuntos(puntos - 1);
        }
        setRespuestaPersona('');
    }

    const pedirAyuda = () => {
        setPistas(pistas + 1);
        setTemporizador(temporizador - 2);
    };

    const guardarPuntuacion = () => {
        const nuevaTablaDePuntos = [...tablaDePuntos, { nombre: nombrePersona, puntos }];
        setTablaDePuntos(nuevaTablaDePuntos);
        localStorage.setItem('tablaPuntos', JSON.stringify(nuevaTablaDePuntos));
    };

    return (
        <div className={styles.contenedor}>
            <h1 className={styles.titulo}>Adivina la Bandera</h1>
            <div className={styles.informacionJugador}>
                <label className={styles.label}>
                    Nombre del Jugador:
                    <input
                        className={styles.input}
                        type="text"
                        value={nombrePersona}
                        onChange={(e) => setNombrePersona(e.target.value)}
                    />
                </label>
                <button className={styles.boton} onClick={guardarPuntuacion}>Guardar Puntuación</button>
            </div>
            {paisElegidoRandom && (
                <div className={styles.juego}>
                    <Image className={styles.imagenBandera} src={paisElegidoRandom.flag} alt={`Flag of ${paisElegidoRandom.name}`} width={200} height={100} />
                    <p className={styles.instrucciones}>Adivina el país:</p>
                    <input
                        className={styles.input}
                        type="text"
                        value={respuestaPersona}
                        onChange={(e) => setRespuestaPersona(e.target.value)}
                    />
                    <button className={styles.botonAdivinar} onClick={adivino}>Adivinar</button>
                    <p className={styles.puntos}>Puntos: {puntos}</p>
                    <p className={styles.temporizador}>Tiempo restante: {temporizador}s</p>
                </div>
            )}
            <div className={styles.tablaPuntos}>
                <h2 className={styles.subtitulo}>Tabla de Puntos</h2>
                <ul className={styles.listaPuntos}>
                    {tablaDePuntos.map((entrada, indice) => (
                        <li className={styles.elementoLista} key={indice}>{entrada.nombre}: {entrada.puntos}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
