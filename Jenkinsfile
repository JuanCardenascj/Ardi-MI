pipeline {
    agent any
    environment {
        // Aquí van las variables para que Docker Compose funcione
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
                // Construye las imágenes de la API y la DB sin levantarlas aún
                sh 'docker compose build'
            }
        }
        stage('Test - Comunicación Real') {
            steps {
                echo 'Levantando contenedores y probando comunicación...'
                sh 'docker compose up -d'
                
                sh 'sleep 10'

                sh '''
                curl -f -X POST http://localhost:8000/solicitudes \
                -H "Content-Type: application/json" \
                -d '{"tipo_residuo": "prueba_jenkins", "direccion": "Calle Falsa 123"}' \
                || (echo "FALLO EL POST" && exit 1)
                '''
                
                sh 'curl -f http://localhost:8000/solicitudes || exit 1'
                
                echo '¡Comunicación entre contenedores verificada con éxito!'
            }
        }
    }
    post {
        always {
            echo 'Limpiando contenedores...'
            // Bajar los contenedores y borrar volúmenes para no dejar basura
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