"use client"; // Declara que este es un componente de cliente

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './page.module.css'; // Asegúrate de que este archivo esté en la misma carpeta

function Home() {
    const [paises, setPaises] = useState([]);
    const [paisElegidoRandom, setPaisElegidoRandom] = useState(null);
    const [respuestaPersona, setRespuestaPersona] = useState('');
    const [puntos, setPuntos] = useState(0);
    const [temporizador, setTemporizador] = useState(15);
    const [nombrePersona, setNombrePersona] = useState('');
    const [nombreTemporal, setNombreTemporal] = useState(''); // Valor temporal del input
    const [tablaDePuntos, setTablaDePuntos] = useState([]);
    const [paisesJugados, setPaisesJugados] = useState(0); // Contador de países jugados
    const limitePaises = 3; 
    const [juegoTerminado, setJuegoTerminado] = useState(false); // Estado para saber si el juego ha terminado
    const [respuestaCorrecta, setRespuestaCorrecta] = useState(false); // Estado para manejar la respuesta correcta

    // Fetch inicial para obtener la lista de países
    useEffect(() => {
        async function getPaises() {
            const respuesta = await fetch('https://countriesnow.space/api/v0.1/countries/flag/images');
            const data = await respuesta.json();
            setPaises(data.data);
            if (nombrePersona) {
                elegirPaisRandom(data.data);
            }
        }
        getPaises();
    }, [nombrePersona]);
    
    // Manejar el temporizador
    useEffect(() => {
        if (temporizador === 0 && !juegoTerminado && !respuestaCorrecta) {
            setPuntos(puntos - 1);
            elegirPaisRandom(paises);
        } else if (temporizador > 0 && !juegoTerminado) {
            const cuentaRegresiva = setTimeout(() => setTemporizador(temporizador - 1), 1000);
            return () => clearTimeout(cuentaRegresiva);
        }
    }, [temporizador, paises, juegoTerminado, respuestaCorrecta]);

    // Cargar puntuaciones guardadas en el localStorage al iniciar
    useEffect(() => {
        const puntuacionesGuardadas = JSON.parse(localStorage.getItem('tablaPuntos')) || [];
        setTablaDePuntos(puntuacionesGuardadas);
    }, []);

    // Elegir un país al azar y reiniciar el temporizador
    const elegirPaisRandom = (paises) => {
        if (paisesJugados >= limitePaises) {
            terminarJuego(); // Guarda la puntuación cuando termina el juego
            return;
        }

        const numeroAleatorio = Math.floor(Math.random() * paises.length);
        setPaisElegidoRandom(paises[numeroAleatorio]);
        setPaisesJugados(paisesJugados + 1); // Incrementamos el contador de países jugados
        setTemporizador(15); // Reiniciar el temporizador
        setRespuestaCorrecta(false); // Resetear el estado de respuesta correcta
    };

 // Función para verificar la respuesta del jugador
const adivino = () => {
    if (respuestaPersona.toLowerCase() === paisElegidoRandom.name.toLowerCase()) {
        // Actualiza la puntuación
        setPuntos(prevPuntos => prevPuntos + 10);
        setRespuestaCorrecta(true); // Marcar como respuesta correcta

        // Solo cambia de país si el juego no ha terminado
        if (!juegoTerminado) {
            elegirPaisRandom(paises); 
        }
    } else {
        setRespuestaPersona(''); // Limpiar el input
    }
};


  // Guardar puntuación en la tabla de puntos
const guardarPuntuacion = () => {
    // Obtener la puntuación final
    const puntuacionFinal = puntos;

    // Actualizar la tabla de puntos
    const nuevaTablaDePuntos = tablaDePuntos.filter(entrada => entrada.nombre !== nombrePersona); // Eliminar puntuaciones antiguas del jugador
    nuevaTablaDePuntos.push({ nombre: nombrePersona, puntos: puntuacionFinal }); // Agregar la puntuación final
    setTablaDePuntos(nuevaTablaDePuntos);
    localStorage.setItem('tablaPuntos', JSON.stringify(nuevaTablaDePuntos));
};


    // Terminar el juego manualmente
// Terminar el juego manualmente
const terminarJuego = () => {
    // Asegúrate de que la puntuación final se guarda
    // Solo llama a adivino si el juego no ha terminado
    if (!juegoTerminado) {
        adivino();
    }

    // Guarda la puntuación automáticamente al terminar
    guardarPuntuacion(); 

    // Marcar el juego como terminado
    setJuegoTerminado(true);
};



    // Reiniciar el juego
    const reiniciarJuego = () => {
        // Inicializar estado del juego
        setPaises([]);
        setPaisElegidoRandom(null);
        setRespuestaPersona('');
        setPuntos(0);
        setTemporizador(15);
        setNombrePersona('');
        setNombreTemporal('');
        setPaisesJugados(0);
        setJuegoTerminado(false);
        setRespuestaCorrecta(false);
        
        // Obtener los países nuevamente
        async function getPaises() {
            const respuesta = await fetch('https://countriesnow.space/api/v0.1/countries/flag/images');
            const data = await respuesta.json();
            setPaises(data.data);
        }
        getPaises();
    };

    // Mostrar formulario para ingresar el nombre antes de empezar
    if (!nombrePersona) {
        return (
            <div className={styles.contenedor}>
                <h1 className={styles.titulo}>Adivina la Bandera</h1>
                <div className={styles.informacionJugador}>
                    <label className={styles.label}>
                        Nombre del Jugador:
                        <input
                            className={styles.input}
                            type="text"
                            value={nombreTemporal} // Almacenamos temporalmente el valor del input
                            onChange={(e) => setNombreTemporal(e.target.value)} // Actualizamos el valor temporal
                        />
                    </label>
                    <button 
                        className={styles.boton}
                        onClick={() => {
                            if (nombreTemporal.length > 0) {
                                setNombrePersona(nombreTemporal); // Asignamos el valor temporal al nombre definitivo
                            }
                        }}
                    >
                        Comenzar Juego
                    </button>
                    <p>Por favor, ingresa tu nombre para comenzar a jugar.</p>
                </div>
            </div>
        );
    }

    if (juegoTerminado) {
        return (
            <div className={styles.contenedor}>
                <h1 className={styles.titulo}>Juego Terminado</h1>
                <p>¡Felicidades {nombrePersona}! Obtuviste {puntos} puntos.</p>
                <div className={styles.tablaPuntos}>
                    <h2 className={styles.subtitulo}>Tabla de Puntos</h2>
                    <ul className={styles.listaPuntos}>
                        {tablaDePuntos.map((entrada, indice) => (
                            <li className={styles.elementoLista} key={indice}>{entrada.nombre}: {entrada.puntos}</li>
                        ))}
                    </ul>
                </div>
                <button className={styles.boton} onClick={reiniciarJuego}>Volver a Jugar</button>
            </div>
        );
    }

    // Vista principal del juego
    return (
        <div className={styles.contenedor}>
            <h1 className={styles.titulo}>Adivina la Bandera</h1>
            {paisElegidoRandom && (
                <div className={styles.juego}>
                    <Image className={styles.imagenBandera} src={paisElegidoRandom.flag} alt={`Flag of ${paisElegidoRandom.name}`} width={200} height={100} />
                    <p>Adivina el país:</p>
                    <input
                        className={styles.input}
                        type="text"
                        value={respuestaPersona}
                        onChange={(e) => setRespuestaPersona(e.target.value)}
                    />
                    <button className={styles.botonAdivinar} onClick={adivino}>Adivinar</button>
                    <p>Puntos: {puntos}</p>
                    <p>Países jugados: {paisesJugados}/{limitePaises}</p>
                    <p>Tiempo restante: {temporizador}s</p>
                    <button className={styles.boton} onClick={terminarJuego}>Terminar Juego</button>
                </div>
            )}
            <div>
                <h2>Tabla de Puntos</h2>
                <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                    {tablaDePuntos.map((entrada, indice) => (
                        <li key={indice}>{entrada.nombre}: {entrada.puntos}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Home;
