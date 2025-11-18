# ----- Build stage -----
# Use Java 21 for build
FROM maven:3.9.7-eclipse-temurin-21 AS build

WORKDIR /app

# Copy the gateway-server (this backend) pom and sources
COPY pom.xml .
COPY src ./src

# Build jar (skip tests for speed)
RUN mvn -q -DskipTests package

# ----- Run stage -----
# Java 21 runtime
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy jar from build image
COPY --from=build /app/target/*.jar app.jar

# Render gives PORT; default 8080
ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]
