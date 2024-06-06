import { Router } from "express";
import { Actualizarlote, Buscarlote,  Registrarlotes, desactivarlote, listarlotes } from "../controllers/lotes.controller.js";
import { validarlotes, validarlotesactualizar } from "../../validate/lotes.validate.js";
import { validarToken } from "../controllers/autenticacion.js";
//nn
const rutalote = Router();

rutalote.get("/listarlote", validarToken,listarlotes);
rutalote.post("/Registrarlote",validarToken,validarlotes, Registrarlotes);
rutalote.put("/Actualizarlote/:id_lote",validarToken,validarlotesactualizar, Actualizarlote);
rutalote.get("/Buscarlote/:id_lote", validarToken,Buscarlote);
rutalote.put("/desactivarlote/:id_lote", validarToken,desactivarlote);


export default rutalote ;
