# ----- Build stage -----
FROM maven:3.9.7-eclipse-temurin-17 AS build

WORKDIR /app

# copy pom and sources from this module
COPY pom.xml .
COPY src ./src

# build jar (skip tests for speed)
RUN mvn -q -DskipTests package

# ----- Run stage -----
FROM eclipse-temurin:17-jre

WORKDIR /app

# copy jar from build image
COPY --from=build /app/target/*.jar app.jar

# Render provides PORT env var, default to 8080
ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]

