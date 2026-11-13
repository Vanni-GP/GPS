from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from psycopg2.extras import RealDictCursor
from database import get_db_connection
import schemas

app = FastAPI(
    title="API Sistema de Agua Potable Comunitario",
    version="1.0.0"
)

# Configuración de CORS para permitir peticiones desde cualquier origen local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def inicio():
    return {"mensaje": "API de Agua Potable Comunitario Funcionando al 100%"}

# ==============================================================================
# 1. RUTAS DE USUARIOS
# ==============================================================================
@app.get("/usuarios")
def obtener_usuarios():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM usuarios ORDER BY id_usuario ASC;")
        usuarios = cursor.fetchall()
        cursor.close()
        conn.close()
        return usuarios
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/usuarios", status_code=201)
def crear_usuario(usuario: schemas.UsuarioBase):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        query = """
            INSERT INTO usuarios (nombre, telefono, direccion_barrio, manzana)
            VALUES (%s, %s, %s, %s) RETURNING *;
        """
        cursor.execute(query, (usuario.nombre, usuario.telefono, usuario.direccion_barrio, usuario.manzana))
        nuevo_usuario = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        return nuevo_usuario
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/usuarios/{id_usuario}")
def eliminar_usuario(id_usuario: int):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM usuarios WHERE id_usuario = %s;", (id_usuario,))
        conn.commit()
        cursor.close()
        conn.close()
        return {"mensaje": f"Usuario con ID {id_usuario} eliminado correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# 2. RUTAS DE TOMAS DE AGUA
# ==============================================================================
@app.get("/tomas")
def obtener_tomas():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        query = """
            SELECT t.*, u.nombre AS nombre_usuario 
            FROM tomas_agua t
            JOIN usuarios u ON t.id_usuario = u.id_usuario
            ORDER BY t.id_toma ASC;
        """
        cursor.execute(query)
        tomas = cursor.fetchall()
        cursor.close()
        conn.close()
        return tomas
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tomas", status_code=201)
def crear_toma(toma: schemas.TomaAguaBase):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        query = """
            INSERT INTO tomas_agua (numero_contrato, tipo_toma, estado_servicio, id_usuario)
            VALUES (%s, %s, %s, %s) RETURNING *;
        """
        cursor.execute(query, (toma.numero_contrato, toma.tipo_toma, toma.estado_servicio, toma.id_usuario))
        nueva_toma = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        return nueva_toma
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# 3. RUTAS DE PAGOS (TESORERÍA)
# ==============================================================================
@app.get("/pagos")
def obtener_pagos():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        query = """
            SELECT p.*, t.numero_contrato, u.nombre AS nombre_usuario
            FROM pagos p
            JOIN tomas_agua t ON p.id_toma = t.id_toma
            JOIN usuarios u ON t.id_usuario = u.id_usuario
            ORDER BY p.id_pago DESC;
        """
        cursor.execute(query)
        pagos = cursor.fetchall()
        cursor.close()
        conn.close()
        return pagos
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/pagos", status_code=201)
def registrar_pago(pago: schemas.PagoBase):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        query = """
            INSERT INTO pagos (fecha_pago, mes_cubierto, año_cubierto, monto, id_toma)
            VALUES (%s, %s, %s, %s, %s) RETURNING *;
        """
        cursor.execute(query, (pago.fecha_pago, pago.mes_cubierto, pago.año_cubierto, pago.monto, pago.id_toma))
        nuevo_pago = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        return nuevo_pago
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# 4. RUTAS DE RECIBOS
# ==============================================================================
@app.get("/recibos")
def obtener_recibos():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        query = """
            SELECT r.*, u.nombre AS nombre_usuario, t.numero_contrato, u.direccion_barrio
            FROM recibos r
            JOIN pagos p ON r.id_pago = p.id_pago
            JOIN tomas_agua t ON p.id_toma = t.id_toma
            JOIN usuarios u ON t.id_usuario = u.id_usuario
            ORDER BY r.folio DESC;
        """
        cursor.execute(query)
        recibos = cursor.fetchall()
        cursor.close()
        conn.close()
        return recibos
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recibos", status_code=201)
def generar_recibo(recibo: schemas.ReciboBase):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        query = """
            INSERT INTO recibos (folio, fecha_emision, monto_total, codigo_qr, id_pago)
            VALUES (%s, %s::date, %s, %s, %s) RETURNING *;
        """
        cursor.execute(query, (
            str(recibo.folio),
            str(recibo.fecha_emision),
            float(recibo.monto_total),
            str(recibo.codigo_qr),
            int(recibo.id_pago)
        ))
        nuevo_recibo = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        return nuevo_recibo
    except Exception as e:
        print("ERROR EN POST /RECIBOS:", str(e))
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# 5. RUTAS DE REPORTES DE FUGAS
# ==============================================================================
@app.get("/fugas")
def obtener_fugas():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        query = """
            SELECT f.*, u.nombre AS reportado_por
            FROM reportes_fugas f
            JOIN usuarios u ON f.id_usuario = u.id_usuario
            ORDER BY f.id_reporte DESC;
        """
        cursor.execute(query)
        fugas = cursor.fetchall()
        cursor.close()
        conn.close()
        return fugas
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/fugas", status_code=201)
def registrar_fuga(fuga: schemas.ReporteFugaBase):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        query = """
            INSERT INTO reportes_fugas (ubicacion, descripcion, fecha_reporte, estatus, id_usuario)
            VALUES (%s, %s, %s, %s, %s) RETURNING *;
        """
        cursor.execute(query, (fuga.ubicacion, fuga.descripcion, fuga.fecha_reporte, fuga.estatus, fuga.id_usuario))
        nueva_fuga = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        return nueva_fuga
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/fugas/{id_reporte}/estatus")
def actualizar_estatus_fuga(id_reporte: int, nuevo_estatus: str):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        query = "UPDATE reportes_fugas SET estatus = %s WHERE id_reporte = %s RETURNING *;"
        cursor.execute(query, (nuevo_estatus, id_reporte))
        fuga_actualizada = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        return fuga_actualizada
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))