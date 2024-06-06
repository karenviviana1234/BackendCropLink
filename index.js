import express  from 'express' 
import  body_parser from 'body-parser'
import cors from 'cors'
import rutaValidacion from './src/routes/autenticacion.js'
import { rutaDeActividad } from './src/routes/Actividad.route.js'
import router from './src/routes/Finca.routes.js'
import rutaProduccion from './src/routes/Produccion.routes.js'
import rutaDeTipoRecurso from './src/routes/TipoRecurso.route.js'
import rutaUsuario from './src/routes/Usuarios.route.js'
import { rutaDeEmpleado } from './src/routes/Empleado.route.js'
import rutaFinca from './src/routes/Finca.routes.js'
import Rutainversiones from './src/routes/Inversiones.route.js'
import rutalote from './src/routes/lotes.routes.js'
import rutaDeVariedad from './src/routes/variedad.routes.js'
import rutaProgramacion from './src/routes/programacion.routes.js'


//servidor
const servidor = express()

servidor.use(cors())
servidor.use(body_parser.json())
servidor.use(body_parser.urlencoded({extended: false}))

servidor.listen(3000, () =>{
    console.log("esta funcionando en el puerto 3000")
})

//ruta
servidor.use(rutaValidacion)
servidor.use('/usuario',rutaUsuario)
servidor.use(rutaDeActividad)
servidor.use(rutaDeTipoRecurso)
servidor.use(rutaDeTipoRecurso)
servidor.use(rutaProduccion)
servidor.use(rutaDeEmpleado)
servidor.use(router)
servidor.use('/finca',rutaFinca)
servidor.use(Rutainversiones)
servidor.use(rutalote)
servidor.use(rutaDeVariedad)
servidor.use(rutaProgramacion)


//carpetas documentacion
servidor.set('view engine', 'ejs');
servidor.set('views','./views');
servidor.get('/documents',(req,res)=>{
    res.render('document.ejs');
})
servidor.use(express.static('./public'));

