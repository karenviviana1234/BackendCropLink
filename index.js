import express  from 'express' 
import  body_parser from 'body-parser'
import cors from 'cors'
import rutaValidacion from './src/routes/autenticacion.js'
import rutaUsuario from './src/routes/Usuarios.route.js'
import rutaProduccion from './src/routes/Produccion.routes.js'
import { rutaDeEmpleado } from './src/routes/Empleado.route.js'






//servidor
const servidor = express()

servidor.use(cors())
servidor.use(body_parser.json())
servidor.use(body_parser.urlencoded({extended: false}))

servidor.listen(3000, () =>{
    console.log("esta funcionando en el puerto 3000")
})

//rutas
servidor.use(rutaValidacion)
servidor.use('/usuario',rutaUsuario)
servidor.use(rutaProduccion)
servidor.use(rutaDeEmpleado)
//carpetas documentacion
servidor.set('view engine', 'ejs');
servidor.set('views','./views');
servidor.get('/documents',(req,res)=>{
    res.render('document.ejs');
})
servidor.use(express.static('./public'));

