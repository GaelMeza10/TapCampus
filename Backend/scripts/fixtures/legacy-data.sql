-- Datos sintéticos; el precio al reservar procede del recibo del fixture,
-- difiere del precio visible y nunca se calcula desde publicaciones.precio.
INSERT INTO usuarios(id,correo,contrasena,nombre,telefono) VALUES
  (1,'seller@uabc.edu.mx','synthetic-hash','Vendedor fixture','6641234567'),
  (2,'buyer@uabc.edu.mx','synthetic-hash','Comprador fixture','+525512345678');
INSERT INTO zonas(id,nombre) VALUES (1,'Gimnasio Universitario'),(2,'Facultad de Ciencias');
INSERT INTO categorias(id,nombre,tipo) VALUES (1,'Snacks','EN_VIVO'),(2,'Batas y Uniformes','ESTATICA');
INSERT INTO publicaciones(id,tipo,foto,titulo,descripcion,precio,vendedorId,categoriaId,zonaId,stockInicial,stockDisponible,horaInicio,horaFin)
VALUES(1,'EN_VIVO','/fixture.png','Producto fixture','Prueba',25.50,1,1,1,4,2,'2026-10-01 10:00','2026-10-01 12:00'),
      (2,'ESTATICA','/fixture.png','Bata fixture','Prueba',100,1,2,2,NULL,NULL,NULL,NULL);
INSERT INTO reservas(id,estado,createdAt,expiracion,compradorId,publicacionId) VALUES
  (1,'RESERVADA','2026-10-01 10:01','2026-10-01 10:21',2,1),
  (2,'VENDIDA','2026-10-01 10:02','2026-10-01 10:22',2,1);
INSERT INTO reportes(id,motivo,usuarioId,publicacionId) VALUES (1,'Prueba sintética',2,2);
