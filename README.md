# 🧾 Extractor de Facturas con IA (Challenge Técnico)

Sistema inteligente que procesa facturas en formato TXT, extrae información estructurada utilizando Modelos de Lenguaje (GPT-4o-mini) y permite la exportación a CSV.

## 🚀 Demo en Vivo
- **Frontend (AWS Lightsail):** http://13.217.0.251/
- **Backend API (AWS Lambda):** https://ys4lryv53qrop5qj7ewtzcgng40twztf.lambda-url.us-east-1.on.aws/

## 🏗️ Arquitectura
El proyecto utiliza una arquitectura desacoplada y serverless:

1.  **Backend (AWS Lambda + Docker):**
    - Escrito en **Python** con **Pydantic** para validación estricta de esquemas.
    - Empaquetado en **Docker** y alojado en **AWS ECR**.
    - Ejecutado en **AWS Lambda** (Serverless) para escalabilidad automática y costo cero en reposo.
    - Se conecta a **OpenAI API** para el análisis semántico.

2.  **Frontend (React + Vite):**
    - Interfaz moderna construida con **TailwindCSS**.
    - Desplegada en una instancia **AWS Lightsail (Ubuntu 22.04)** servida por **Nginx**.
    - Se comunica directamente con la Lambda (evitando middleware innecesario).

## 🛠️ Tecnologías
- **Core:** Python 3.9, React 18.
- **AI:** OpenAI GPT-4o-mini via API.
- **Infraestructura:** AWS Lambda, AWS ECR, AWS Lightsail.
- **Herramientas:** Docker, Git, Nginx.

## ⚙️ Instalación Local

### Backend
```bash
cd facturas_bia
python -m venv venv
source venv/bin/activate  # o venv\Scripts\activate en Windows
pip install -r requirements.txt
# Crear .env con OPENAI_API_KEY
python main_local.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
### 🔐 Configuración y Variables de Entorno

Este proyecto utiliza **Variables de Entorno** para manejar configuraciones sensibles y dinámicas (credenciales de base de datos, API Keys, endpoints, etc.) sin "quemar" (hardcode) valores en el código fuente.

#### ¿Cómo funcionan en AWS Lambda?
En el entorno de AWS Lambda, estas variables se inyectan dinámicamente en el tiempo de ejecución (runtime). El código accede a ellas a través del sistema operativo del contenedor.

* **En el código (Python ejemplo):** Se utiliza `os.environ.get('NOMBRE_VARIABLE')` para leer el valor.
* **En la infraestructura:** Se configuran desde la consola de AWS Lambda (pestaña *Configuration* -> *Environment variables*) o mediante IaC (Terraform/CloudFormation/SAM).

#### ⚠️ Importante: ¿Por qué no están en el repositorio?

1.  **Seguridad:** Las credenciales y secretos nunca deben ser subidos al control de versiones (Git) para evitar filtraciones de seguridad.
2.  **Flexibilidad:** Esto permite desplegar el mismo código en distintos entornos (Dev, QA, Prod) simplemente cambiando los valores de configuración en AWS, sin tocar el código.

> **Nota:** El archivo `.env` local ha sido excluido mediante `.gitignore`. Para ejecutar este proyecto de manera 100% local, deberás configurar manualmente las variables de entorno.

### Decisiones Técnicas
#### Contenerización (Docker + ECR)
Decisión: Empaquete el código Python en imágenes Docker en lugar de ZIPs tradicionales.
Para garantizar la paridad entre desarrollo y producción. Elimina problemas de compatibilidad de librerías compiladas (como pandas o pydantic) al desplegar desde Windows a un entorno Linux en la nube.

#### Fiabilidad de IA (Pydantic + Prompt Engineering)
Decisión: Uso de Pydantic para validación estricta de esquemas y prompts de sistema con reglas negativas.
Los LLMs no son determinista por lo que Pydantic actúa como un "firewall lógico", asegurando que la respuesta de la IA cumpla estrictamente con los tipos de datos requeridos antes de llegar al frontend, mitigando alucinaciones.

#### Infraestructura Frontend (AWS Lightsail)
Decisión: Despliegue manual en una maquina Ligthsail por su facilidad de despliegue y control manual, ademas de su bajo costo.



#### 2. Correo de Entrega (Template)

**Asunto:** Entrega Prueba Técnica - Andres David Caro Mora.

**Cuerpo:**

Hola Paola,
Espero que estés muy bien.
Adjunto la solución al reto técnico de extracción de facturas. He implementado una solución completa desplegada en AWS.
**Resumen de la entrega:**
* **Repositorio:** https://github.com/AnCaroM/reto-facturas-ia
* **Demo Online:** http://13.217.0.251/

**Destacados de la arquitectura:**
* **Backend Serverless:** Implementado en AWS Lambda usando imágenes Docker (ECR) para garantizar consistencia y escalabilidad.
* **Frontend:** Desplegado en un servidor Linux (AWS Lightsail) configurado manualmente con Nginx.
* **IA:** Uso de GPT-4o-mini con validación estricta de esquemas (Pydantic) para asegurar datos estructurados y manejo de errores robusto.



Saludos,
Andres David Caro Mora
3212458207
https://www.linkedin.com/in/andres-david-caro-mora-1a3174275/

---