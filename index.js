import express  from 'express' 
import  body_parser from 'body-parser'
import cors from 'cors'


//rutas


//servidor
const servidor = express()

servidor.use(cors())
servidor.use(body_parser.json())
servidor.use(body_parser.urlencoded({extended: false}))

servidor.listen(3000, () =>{
    console.log("esta funcionando en el puerto 3000")
})

//rutas


//carpetas documentacion
servidor.set('view engine', 'ejs');
servidor.set('views','./views');
servidor.get('/documents',(req,res)=>{
    res.render('document.ejs');
})
servidor.use(express.static('./public'));

