pipeline {
    agent any
    environment {
        COMPOSE_PROJECT_NAME = 'ardi_jenkins_test'
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Build') {
            steps {
                echo 'Construyendo las imágenes de los contenedores...'
                sh '''
                    echo "DB_NAME=ardi_db" > .env
                    echo "DB_USER=ardi_user" >> .env
                    echo "DB_PASSWORD=ardi_password" >> .env
                '''
                sh 'docker compose build'
            }
        }
        stage('Test - Comunicación Real') {
            steps {
                echo 'Levantando contenedores y probando comunicación...'
                sh 'docker compose up -d'
                sh 'sleep 15'
                
                // Usamos Python (que sí está en el contenedor) para hacer el POST
                sh '''
                docker exec ardi_api python -c "
import urllib.request, json
data = json.dumps({'tipo_residuo': 'prueba_jenkins', 'direccion': 'Calle Falsa 123'}).encode('utf-8')
req = urllib.request.Request('http://localhost:8000/solicitudes', data=data, headers={'Content-Type': 'application/json'})
try:
    response = urllib.request.urlopen(req)
    print('Status:', response.status)
    print(response.read().decode('utf-8'))
except Exception as e:
    print('Error:', e)
    exit(1)
"
                '''
                echo '¡Comunicación entre contenedores verificada con éxito!'
            }
        }
    }
    post {
        always {
            echo 'Limpiando contenedores...'
            sh 'docker compose down -v'
        }
        success {
            echo 'Pipeline completado con éxito.'
        }
        failure {
            echo 'El pipeline falló. Revisa los logs.'
        }
    }
}