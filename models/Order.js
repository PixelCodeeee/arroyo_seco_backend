// Add to your Orden model
const orderFields = `
  id_orden INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_oferente INT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  estado ENUM('pendiente', 'pagado', 'cancelado', 'completado') DEFAULT 'pendiente',
  metodo_pago VARCHAR(50),
  transaction_id VARCHAR(255),
  items JSON,
  fecha_orden TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
  FOREIGN KEY (id_oferente) REFERENCES oferente(id_oferente)
`;