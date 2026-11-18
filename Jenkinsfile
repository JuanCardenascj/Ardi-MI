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
                
                // CAMBIO CLAVE: Ejecutar curl DENTRO del contenedor de la API
                // Usamos 'localhost' porque estamos dentro del contenedor api
                sh '''
                docker exec ardi_api curl -f -X POST http://localhost:8000/solicitudes \
                -H "Content-Type: application/json" \
                -d '{"tipo_residuo": "prueba_jenkins", "direccion": "Calle Falsa 123"}' \
                || (echo "FALLO EL POST" && exit 1)
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