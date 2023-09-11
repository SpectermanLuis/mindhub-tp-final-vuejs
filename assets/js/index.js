
const { createApp } = Vue

const app = createApp({
    data() {
        return {
            message: 'Hola desde mi aplicacion de Vue!',
            url: "https://mindhub-xj03.onrender.com/api/amazing",
            datosObtenidos: [],
            arregloEventosBase: {},
            checkBoxes: [],
            checkBoxesSeleccionados: [],
            texto: '',
            eventosParaCard: [],
            evento: null,

            eventoHightPorcAttendance: null,
            eventoLowPorcAttendance: null,
            eventoConMayorCapacidad: null,

            resumenEventosUp: [],
            resumenEventosPast: [],
        }
    },
    mounted() {

    },
    created() {
        this.traerDatos()
    },
    methods: {
        traerDatos() {
            // Obtener datos desde la api (url) 
            // Procesar segun que pagina este activada
            fetch(this.url)
                .then(response => response.json())
                .then(datosApi => {
                    this.datosObtenidos = datosApi

                    // generar arreglo base segun en que pagina se este 
                    if (document.title === "Index" || document.title === "Stats") {
                        this.arregloEventosBase = this.datosObtenidos.events
                    } else if (document.title === "Upcoming_Events") {
                        this.arregloEventosBase = this.datosObtenidos.events.filter(evento => evento.date >= this.datosObtenidos.currentDate)
                    } else if (document.title === "Past_Events") {
                        this.arregloEventosBase = this.datosObtenidos.events.filter(evento => evento.date < this.datosObtenidos.currentDate)
                    }

                    // switch unicos con categorias 
                    this.checkBoxes = [...new Set(this.datosObtenidos.events.map(event => event.category))]

                    // pagina details
                    let id = new URLSearchParams(window.location.search).get('id')
                    this.evento = this.datosObtenidos.events.find(evento => evento._id == id)

                    // stats
                    this.generaCamposCalculadosTabla1()
                    console.log(this.eventoHightPorcAttendance)
                    console.log(this.eventoLowPorcAttendance)
                    console.log(this.eventoConMayorCapacidad)
                    this.generaCamposCalculadosTabla2()
                    this.generaCamposCalculadosTabla3()


                })
                .catch(error => console.log(error))
        },

        generaCamposCalculadosTabla1() {

            let datos = this.datosObtenidos

            // agrego nuevas propiedades a los eventos con total de ganancia y % asistencia
            // segun sea upcoming(estimate) o past(assistance) 
            datos.events.forEach(evento => {
                if (evento.date >= datos.currentDate) {
                    // calculo evento upcoming
                    evento.ganancia = evento.price * evento.estimate
                    evento.porcAsistencia = parseFloat(((evento.estimate * 100) / evento.capacity).toFixed(2));
                } else {
                    // calculo evento past
                    evento.ganancia = evento.price * evento.assistance
                    evento.porcAsistencia = parseFloat(((evento.assistance * 100) / evento.capacity).toFixed(2));
                }

            })

            let eventosFiltradosPast = datos.events.filter(evento => evento.date < datos.currentDate)
            eventosFiltradosPast.sort((a, b) => b.porcAsistencia - a.porcAsistencia);

            this.eventoHightPorcAttendance = eventosFiltradosPast[0]
            this.eventoLowPorcAttendance = eventosFiltradosPast[eventosFiltradosPast.length - 1]

            let eventosOrdenCapacidadAZ = datos.events.sort((a, b) => b.capacity - a.capacity);
            this.eventoConMayorCapacidad = eventosOrdenCapacidadAZ[0]

        },

        generaCamposCalculadosTabla2() {

            let datos = this.datosObtenidos
            let arregloEventosNecesarios = []
            arregloEventosNecesarios = datos.events.filter(evento => evento.date >= datos.currentDate)

            let categoriasUnicas = [...new Set(arregloEventosNecesarios.map(evento => evento.category))]

            categoriasUnicas.forEach(categoria => {
                let arregloUpCategoria = arregloEventosNecesarios.filter(evento => evento.category === categoria)

                let datosEvento = arregloUpCategoria.map(evento => miniEvento = { ganancia: evento.ganancia, porcAsistencia: evento.porcAsistencia })

                let acumGananciaEvento = 0
                let acumPorcAsistenciaEvento = 0.00

                datosEvento.forEach(datoEvento => {
                    acumGananciaEvento = acumGananciaEvento + datoEvento.ganancia
                    acumPorcAsistenciaEvento = acumPorcAsistenciaEvento + datoEvento.porcAsistencia
                })

                // calcular promedio porcAsistencia 
                let promPorcAsistenciaEvento = (acumPorcAsistenciaEvento / datosEvento.length).toFixed(2)
                this.resumenEventosUp.push({ category: categoria, revenues: acumGananciaEvento, porcAsistencia: promPorcAsistenciaEvento })


            })

            console.log(this.resumenEventosUp)
        },

        generaCamposCalculadosTabla3() {

            let datos = this.datosObtenidos
            let arregloEventosNecesarios = []
            arregloEventosNecesarios = datos.events.filter(evento => evento.date < datos.currentDate)

            let categoriasUnicas = [...new Set(arregloEventosNecesarios.map(evento => evento.category))]

            categoriasUnicas.forEach(categoria => {
                let arregloUpCategoria = arregloEventosNecesarios.filter(evento => evento.category === categoria)

                let datosEvento = arregloUpCategoria.map(evento => miniEvento = { ganancia: evento.ganancia, porcAsistencia: evento.porcAsistencia })

                let acumGananciaEvento = 0
                let acumPorcAsistenciaEvento = 0.00

                datosEvento.forEach(datoEvento => {
                    acumGananciaEvento = acumGananciaEvento + datoEvento.ganancia
                    acumPorcAsistenciaEvento = acumPorcAsistenciaEvento + datoEvento.porcAsistencia
                })

                // calcular promedio porcAsistencia 
                let promPorcAsistenciaEvento = (acumPorcAsistenciaEvento / datosEvento.length).toFixed(2)
                this.resumenEventosPast.push({ category: categoria, revenues: acumGananciaEvento, porcAsistencia: promPorcAsistenciaEvento })

            })

            console.log(this.resumenEventosPast)
        },

    },
    computed: {
        filtrarPorTexto() {
            this.eventosParaCard = this.arregloEventosBase.filter(evento => evento.name.toLowerCase().includes(this.texto.toLowerCase()))
        },
        filtrarPorCategoria() {
            if (this.checkBoxesSeleccionados.length == 0) {
                this.eventosParaCard = this.arregloEventosBase
            } else {
                this.eventosParaCard = this.arregloEventosBase.filter(evento => this.checkBoxesSeleccionados.includes(evento.category))
            }
        },
        filtroCruzado() {
            let aux = this.arregloEventosBase.filter(evento => evento.name.toLowerCase().includes(this.texto.toLowerCase()))
            if (this.checkBoxesSeleccionados.length == 0) {
                this.eventosParaCard = aux
            } else {
                this.eventosParaCard = aux.filter(evento => this.checkBoxesSeleccionados.includes(evento.category))
            }
        },

    }
})

app.mount('#app')