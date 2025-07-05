-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 18-07-2024 a las 04:20:01
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `crop_link`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `actividad`
--

CREATE TABLE `actividad` (
  `id_actividad` int(11) NOT NULL,
  `nombre_actividad` varchar(200) NOT NULL,
  `tiempo` time NOT NULL,
  `observaciones` varchar(200) NOT NULL,
  `valor_actividad` float NOT NULL,
  `fk_id_variedad` int(11) NOT NULL,
  `fk_id_tipo_recursos` int(11) DEFAULT NULL,
  `observacion` varchar(100) NOT NULL,
  `estado` enum('activo','proceso','terminado','inactivo') NOT NULL,
  `admin_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `actividad`
--

INSERT INTO `actividad` (`id_actividad`, `nombre_actividad`, `tiempo`, `observaciones`, `valor_actividad`, `fk_id_variedad`, `fk_id_tipo_recursos`, `observacion`, `estado`, `admin_id`) VALUES
(1, 'paliar cafetal', '07:23:12', 'no tengo', 40000, 3, NULL, 'no pude ir ', 'inactivo', 1027525510),
(2, 'cortar cafe', '05:00:00', 'no', 50000, 2, NULL, '', 'activo', 1027525510),
(3, 'pilar cafe', '07:00:00', 'no tengo', 3000120, 1, NULL, '', 'inactivo', 1027525510),
(4, 'cepillar caballo', '07:23:12', 'no', 500000, 1, NULL, '', 'inactivo', 1027525510),
(5, 'descansar', '07:23:12', 'no', 30000, 2, NULL, '', 'activo', 1027525510),
(6, 'Ir a dormir', '09:00:00', 'Duerma', 7890, 2, NULL, '', 'activo', 1027525510),
(7, 'Ir a dormir', '09:00:00', 'Duerma', 7890, 2, NULL, '', 'activo', 1027525510),
(8, 'pruebaaaasote', '12:21:10', 'es pruebaa', 19324700, 4, NULL, '', 'activo', 1027525510),
(9, 'ruebaa', '22:12:10', 'no tengo', 1000, 4, NULL, '', 'activo', 1027525510),
(10, 'revisar todo', '12:21:10', 'no tengo', 1000, 5, NULL, '', 'inactivo', 1027525510),
(11, 'hoy', '22:12:11', 'no', 2999, 2, NULL, '', 'activo', 1027525510),
(12, 'darioo', '12:21:00', 'no', 3000120, 2, NULL, '', 'activo', 1027525510),
(13, 'darioo', '12:21:10', 'no tengo', 1000, 5, NULL, '', 'activo', 1027525510),
(14, 'nuevo', '02:21:00', 'es de prueba', 1000, 3, NULL, '', 'activo', 1027525510);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `actividad_tipo_recursos`
--

CREATE TABLE `actividad_tipo_recursos` (
  `id_actividad_tipo` int(11) NOT NULL,
  `fk_id_actividad` int(11) DEFAULT NULL,
  `fk_id_tipo_recursos` int(11) DEFAULT NULL,
  `admin_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `actividad_tipo_recursos`
--

INSERT INTO `actividad_tipo_recursos` (`id_actividad_tipo`, `fk_id_actividad`, `fk_id_tipo_recursos`, `admin_id`) VALUES
(11, 4, 1, NULL),
(12, 4, 3, NULL),
(20, 1, 2, NULL),
(21, 6, 2, NULL),
(22, 7, 2, NULL),
(23, 8, 2, NULL),
(24, 8, 5, NULL),
(25, 8, 3, NULL),
(27, 3, 2, NULL),
(32, 5, 2, NULL),
(33, 5, 3, NULL),
(34, 5, 4, NULL),
(35, 5, 5, NULL),
(40, 9, 1, NULL),
(41, 9, 3, NULL),
(42, 9, 4, NULL),
(43, 9, 5, NULL),
(44, 9, 2, NULL),
(45, 10, 4, NULL),
(46, 11, 1, NULL),
(47, 12, 1, NULL),
(48, 13, 3, NULL),
(49, 2, 1, NULL),
(50, 2, 4, NULL),
(51, 14, 4, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `costos`
--

CREATE TABLE `costos` (
  `id_costos` int(11) NOT NULL,
  `precio` int(11) NOT NULL,
  `fk_id_tipo_recursos` int(11) NOT NULL,
  `estado` enum('activo','inactivo') NOT NULL,
  `admin_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `costos`
--

INSERT INTO `costos` (`id_costos`, `precio`, `fk_id_tipo_recursos`, `estado`, `admin_id`) VALUES
(1, 20000, 1, 'activo', 1027525510),
(2, 10000, 2, 'activo', 1027525510),
(5, 123, 2, 'activo', 1027525510),
(6, 1233333, 4, 'activo', 1027525510);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cultivo`
--

CREATE TABLE `cultivo` (
  `id_cultivo` int(11) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `cantidad_sembrada` int(11) NOT NULL,
  `fk_id_lote` int(11) NOT NULL,
  `fk_id_variedad` int(11) NOT NULL,
  `estado` enum('activo','inactivo') NOT NULL,
  `admin_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `cultivo`
--

INSERT INTO `cultivo` (`id_cultivo`, `fecha_inicio`, `cantidad_sembrada`, `fk_id_lote`, `fk_id_variedad`, `estado`, `admin_id`) VALUES
(1, '2024-06-05', 200, 1, 1, 'inactivo', 1027525510),
(2, '2024-06-19', 300, 3, 3, 'inactivo', 1027525510);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `finca`
--

CREATE TABLE `finca` (
  `id_finca` int(11) NOT NULL,
  `nombre_finca` varchar(200) NOT NULL,
  `longitud` float NOT NULL,
  `latitud` float NOT NULL,
  `estado` enum('activo','inactivo') NOT NULL,
  `admin_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `finca`
--

INSERT INTO `finca` (`id_finca`, `nombre_finca`, `longitud`, `latitud`, `estado`, `admin_id`) VALUES
(1, 'yamboro', -77, 5, 'inactivo', 1027525510),
(2, 'brusuelas', -76.5, 6, 'inactivo', 1027525510),
(3, 'Ruizseñor', -75.4, 10.38, 'inactivo', 1027525510),
(4, 'sinai', -66.9, 4.3, 'inactivo', 1027525510),
(5, 'otraa', -67.1, 12, 'inactivo', 1027525510),
(6, 'wilson', -76.2, 10.2, 'activo', 1027525510);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lotes`
--

CREATE TABLE `lotes` (
  `id_lote` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `longitud` float NOT NULL,
  `latitud` float NOT NULL,
  `fk_id_finca` int(11) NOT NULL,
  `estado` enum('activo','inactivo') NOT NULL,
  `admin_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `lotes`
--

INSERT INTO `lotes` (`id_lote`, `nombre`, `longitud`, `latitud`, `fk_id_finca`, `estado`, `admin_id`) VALUES
(1, 'el jardin', 20, 21, 1, 'inactivo', 1027525510),
(2, 'rosales', 12, 32, 2, 'inactivo', 1027525510),
(3, 'carmela', 12, 44, 1, 'inactivo', 1027525510),
(4, 'Hola', 87, 90, 1, 'inactivo', 1027525510),
(5, 'lotesito', 152, 12, 6, 'activo', 1027525510);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `produccion`
--

CREATE TABLE `produccion` (
  `id_producccion` int(11) NOT NULL,
  `cantidad_produccion` int(11) NOT NULL,
  `precio` float NOT NULL,
  `valor_inversion` int(11) NOT NULL,
  `fk_id_programacion` int(11) NOT NULL,
  `estado` enum('activo','inactivo') NOT NULL,
  `admin_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `produccion`
--

INSERT INTO `produccion` (`id_producccion`, `cantidad_produccion`, `precio`, `valor_inversion`, `fk_id_programacion`, `estado`, `admin_id`) VALUES
(1, 3, 234, 0, 1, 'activo', 1027525510),
(2, 789, 70000, 0, 1, 'activo', 1027525510),
(3, 890, 876, 0, 1, 'inactivo', 1027525510),
(4, 8200, 5000, 0, 1, 'activo', 1027525510),
(5, 100, 9000, 20000, 1, 'activo', 1027525510),
(6, 222700, 19000, 101230, 3, 'activo', 1027525510),
(7, 1700, 19000, 101230, 3, 'activo', 1027525510);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion`
--

CREATE TABLE `programacion` (
  `id_programacion` int(11) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `estado` enum('activo','proceso','terminado','inactivo') NOT NULL,
  `fk_identificacion` int(11) NOT NULL,
  `fk_id_actividad` int(11) NOT NULL,
  `fk_id_lote` int(11) DEFAULT NULL,
  `admin_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `programacion`
--

INSERT INTO `programacion` (`id_programacion`, `fecha_inicio`, `fecha_fin`, `estado`, `fk_identificacion`, `fk_id_actividad`, `fk_id_lote`, `admin_id`) VALUES
(1, '2024-07-15', '2024-07-17', 'activo', 2147483647, 1, 3, 1027525510),
(3, '2024-06-20', '2024-06-22', 'inactivo', 98400, 3, 1, 1027525510),
(4, '2024-02-11', '0000-00-00', 'activo', 2147483647, 3, 2, 1027525510),
(5, '2024-07-11', '2024-07-12', 'inactivo', 1044323001, 10, 5, 1027525510),
(12, '2024-07-12', '2024-07-14', 'proceso', 1044323001, 12, 5, 1027525510),
(22, '2024-07-13', '2024-07-15', 'activo', 2147483647, 11, 5, 1027525510),
(23, '2024-07-15', '2024-07-17', 'activo', 2147483647, 11, 5, 1027525510),
(24, '2024-07-15', '2024-07-17', 'activo', 2147483647, 11, 5, 1027525510),
(25, '2024-07-17', '2024-07-25', 'activo', 1044323001, 14, 5, 1027525510);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_recursos`
--

CREATE TABLE `tipo_recursos` (
  `id_tipo_recursos` int(11) NOT NULL,
  `nombre_recursos` varchar(200) NOT NULL,
  `cantidad_medida` float NOT NULL,
  `unidades_medida` enum('ml','litro','g','kg','unidad') NOT NULL,
  `extras` varchar(50) NOT NULL,
  `estado` enum('existente','gastada_o') NOT NULL,
  `admin_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `tipo_recursos`
--

INSERT INTO `tipo_recursos` (`id_tipo_recursos`, `nombre_recursos`, `cantidad_medida`, `unidades_medida`, `extras`, `estado`, `admin_id`) VALUES
(1, 'cuchilla', 1, 'unidad', 'no', 'existente', 1027525510),
(2, 'aceite', 10, 'litro', 'no', 'existente', 1027525510),
(3, 'kit de guadañador', 1, 'unidad', 'es el conjunto ', 'existente', 1027525510),
(4, 'machete', 1, 'unidad', 'no', 'existente', 1027525510),
(5, 'pala ', 1, 'unidad', 'no', 'existente', 1027525510);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `identificacion` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `correo` varchar(200) NOT NULL,
  `password` varchar(200) NOT NULL,
  `rol` enum('administrador','empleado','','') NOT NULL,
  `imagen` varchar(200) NOT NULL,
  `estado` enum('activo','inactivo') NOT NULL,
  `admin_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`identificacion`, `nombre`, `apellido`, `correo`, `password`, `rol`, `imagen`, `estado`, `admin_id`) VALUES
(17283, 'Daniel', 'Gonzales', 'danigo@gmailcom', '123456789daniel', 'administrador', '', 'activo', NULL),
(98400, 'Juan Camilo', 'Realpe Ceron mor :)', 'Juan@gmail.com', '123456789juan', 'empleado', '', 'inactivo', 1027525510),
(1017798921, 'paola', 'Jara', 'paola@gmail.com', 'paolaaa', 'empleado', '', 'inactivo', 1027525510),
(1027525510, 'luci ', 'per  ', 'luci@12.com', 'lucifer', 'administrador', '', 'activo', NULL),
(1044323001, 'Instru', 'Carvajar', 'alejandropasaje799@gmail.com', 'wilson123', 'empleado', '', 'activo', 1027525510),
(2147483647, 'julian ', 'daza', 'danigobra2020@gmail.com', '102030', 'empleado', '', 'activo', 1027525510);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `variedad`
--

CREATE TABLE `variedad` (
  `id_variedad` int(11) NOT NULL,
  `nombre_variedad` varchar(25) NOT NULL,
  `tipo_cultivo` enum('alimentarios','textiles','oleaginosos','ornamentales','industriales') NOT NULL,
  `estado` enum('activo','inactivo') NOT NULL,
  `admin_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `variedad`
--

INSERT INTO `variedad` (`id_variedad`, `nombre_variedad`, `tipo_cultivo`, `estado`, `admin_id`) VALUES
(1, 'cafe borbom', 'alimentarios', 'activo', 1027525510),
(2, 'cafe rosa', 'alimentarios', 'activo', 1027525510),
(3, 'cafe comun', 'alimentarios', 'activo', 1027525510),
(4, 'Cebolla', 'alimentarios', 'activo', 1027525510),
(5, 'Algodon', 'textiles', 'activo', 1027525510);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `actividad`
--
ALTER TABLE `actividad`
  ADD PRIMARY KEY (`id_actividad`),
  ADD KEY `actividad_variedad` (`fk_id_variedad`),
  ADD KEY `fk_admin_id_actividad` (`admin_id`),
  ADD KEY `fk_actividad_tipo_recursos` (`fk_id_tipo_recursos`);

--
-- Indices de la tabla `actividad_tipo_recursos`
--
ALTER TABLE `actividad_tipo_recursos`
  ADD PRIMARY KEY (`id_actividad_tipo`),
  ADD KEY `fk_id_actividad` (`fk_id_actividad`),
  ADD KEY `fk_id_tipo_recursos` (`fk_id_tipo_recursos`),
  ADD KEY `admin_id` (`admin_id`);

--
-- Indices de la tabla `costos`
--
ALTER TABLE `costos`
  ADD PRIMARY KEY (`id_costos`),
  ADD KEY `costos_tipo_recursos` (`fk_id_tipo_recursos`),
  ADD KEY `fk_admin_id_costos` (`admin_id`);

--
-- Indices de la tabla `cultivo`
--
ALTER TABLE `cultivo`
  ADD PRIMARY KEY (`id_cultivo`),
  ADD KEY `cultivo_variedad` (`fk_id_variedad`),
  ADD KEY `cultivo_lotes` (`fk_id_lote`),
  ADD KEY `fk_admin_id_cultivo` (`admin_id`);

--
-- Indices de la tabla `finca`
--
ALTER TABLE `finca`
  ADD PRIMARY KEY (`id_finca`),
  ADD KEY `admin_id` (`admin_id`);

--
-- Indices de la tabla `lotes`
--
ALTER TABLE `lotes`
  ADD PRIMARY KEY (`id_lote`),
  ADD KEY `lotes_finca` (`fk_id_finca`),
  ADD KEY `fk_admin_id_lotes` (`admin_id`);

--
-- Indices de la tabla `produccion`
--
ALTER TABLE `produccion`
  ADD PRIMARY KEY (`id_producccion`),
  ADD KEY `produccion_cultivo` (`fk_id_programacion`),
  ADD KEY `fk_admin_id_produccion` (`admin_id`);

--
-- Indices de la tabla `programacion`
--
ALTER TABLE `programacion`
  ADD PRIMARY KEY (`id_programacion`),
  ADD KEY `fk_programacion_actividad` (`fk_id_actividad`),
  ADD KEY `programacion_usuarios` (`fk_identificacion`),
  ADD KEY `programacion_cultivos` (`fk_id_lote`),
  ADD KEY `fk_admin_id_programacion` (`admin_id`);

--
-- Indices de la tabla `tipo_recursos`
--
ALTER TABLE `tipo_recursos`
  ADD PRIMARY KEY (`id_tipo_recursos`),
  ADD KEY `fk_admin_id_tipo_recursos` (`admin_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`identificacion`),
  ADD KEY `fk_admin_id` (`admin_id`);

--
-- Indices de la tabla `variedad`
--
ALTER TABLE `variedad`
  ADD PRIMARY KEY (`id_variedad`),
  ADD KEY `fk_admin_id_variedad` (`admin_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `actividad`
--
ALTER TABLE `actividad`
  MODIFY `id_actividad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `actividad_tipo_recursos`
--
ALTER TABLE `actividad_tipo_recursos`
  MODIFY `id_actividad_tipo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT de la tabla `costos`
--
ALTER TABLE `costos`
  MODIFY `id_costos` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `cultivo`
--
ALTER TABLE `cultivo`
  MODIFY `id_cultivo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `finca`
--
ALTER TABLE `finca`
  MODIFY `id_finca` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `lotes`
--
ALTER TABLE `lotes`
  MODIFY `id_lote` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `produccion`
--
ALTER TABLE `produccion`
  MODIFY `id_producccion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `programacion`
--
ALTER TABLE `programacion`
  MODIFY `id_programacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `tipo_recursos`
--
ALTER TABLE `tipo_recursos`
  MODIFY `id_tipo_recursos` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `variedad`
--
ALTER TABLE `variedad`
  MODIFY `id_variedad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `actividad`
--
ALTER TABLE `actividad`
  ADD CONSTRAINT `actividad_variedad` FOREIGN KEY (`fk_id_variedad`) REFERENCES `variedad` (`id_variedad`),
  ADD CONSTRAINT `fk_actividad_tipo_recursos` FOREIGN KEY (`fk_id_tipo_recursos`) REFERENCES `tipo_recursos` (`id_tipo_recursos`),
  ADD CONSTRAINT `fk_admin_id_actividad` FOREIGN KEY (`admin_id`) REFERENCES `usuarios` (`identificacion`);

--
-- Filtros para la tabla `actividad_tipo_recursos`
--
ALTER TABLE `actividad_tipo_recursos`
  ADD CONSTRAINT `actividad_tipo_recursos_ibfk_1` FOREIGN KEY (`fk_id_actividad`) REFERENCES `actividad` (`id_actividad`),
  ADD CONSTRAINT `actividad_tipo_recursos_ibfk_2` FOREIGN KEY (`fk_id_tipo_recursos`) REFERENCES `tipo_recursos` (`id_tipo_recursos`),
  ADD CONSTRAINT `actividad_tipo_recursos_ibfk_3` FOREIGN KEY (`admin_id`) REFERENCES `usuarios` (`identificacion`);

--
-- Filtros para la tabla `costos`
--
ALTER TABLE `costos`
  ADD CONSTRAINT `costos_tipo_recursos` FOREIGN KEY (`fk_id_tipo_recursos`) REFERENCES `tipo_recursos` (`id_tipo_recursos`),
  ADD CONSTRAINT `fk_admin_id_costos` FOREIGN KEY (`admin_id`) REFERENCES `usuarios` (`identificacion`);

--
-- Filtros para la tabla `cultivo`
--
ALTER TABLE `cultivo`
  ADD CONSTRAINT `cultivo_lotes` FOREIGN KEY (`fk_id_lote`) REFERENCES `lotes` (`id_lote`),
  ADD CONSTRAINT `cultivo_variedad` FOREIGN KEY (`fk_id_variedad`) REFERENCES `variedad` (`id_variedad`),
  ADD CONSTRAINT `fk_admin_id_cultivo` FOREIGN KEY (`admin_id`) REFERENCES `usuarios` (`identificacion`);

--
-- Filtros para la tabla `finca`
--
ALTER TABLE `finca`
  ADD CONSTRAINT `finca_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `usuarios` (`identificacion`);

--
-- Filtros para la tabla `lotes`
--
ALTER TABLE `lotes`
  ADD CONSTRAINT `fk_admin_id_lotes` FOREIGN KEY (`admin_id`) REFERENCES `usuarios` (`identificacion`),
  ADD CONSTRAINT `lotes_finca` FOREIGN KEY (`fk_id_finca`) REFERENCES `finca` (`id_finca`);

--
-- Filtros para la tabla `produccion`
--
ALTER TABLE `produccion`
  ADD CONSTRAINT `fk_admin_id_produccion` FOREIGN KEY (`admin_id`) REFERENCES `usuarios` (`identificacion`),
  ADD CONSTRAINT `produccion_ibfk_1` FOREIGN KEY (`fk_id_programacion`) REFERENCES `programacion` (`id_programacion`);

--
-- Filtros para la tabla `programacion`
--
ALTER TABLE `programacion`
  ADD CONSTRAINT `fk_admin_id_programacion` FOREIGN KEY (`admin_id`) REFERENCES `usuarios` (`identificacion`),
  ADD CONSTRAINT `fk_programacion_actividad` FOREIGN KEY (`fk_id_actividad`) REFERENCES `actividad` (`id_actividad`),
  ADD CONSTRAINT `programacion_ibfk_1` FOREIGN KEY (`fk_id_lote`) REFERENCES `lotes` (`id_lote`),
  ADD CONSTRAINT `programacion_usuarios` FOREIGN KEY (`fk_identificacion`) REFERENCES `usuarios` (`identificacion`);

--
-- Filtros para la tabla `tipo_recursos`
--
ALTER TABLE `tipo_recursos`
  ADD CONSTRAINT `fk_admin_id_tipo_recursos` FOREIGN KEY (`admin_id`) REFERENCES `usuarios` (`identificacion`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_admin_id` FOREIGN KEY (`admin_id`) REFERENCES `usuarios` (`identificacion`);

--
-- Filtros para la tabla `variedad`
--
ALTER TABLE `variedad`
  ADD CONSTRAINT `fk_admin_id_variedad` FOREIGN KEY (`admin_id`) REFERENCES `usuarios` (`identificacion`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
