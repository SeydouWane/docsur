FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml ./
RUN mvn -q -B dependency:go-offline
COPY src ./src
RUN mvn -q -B -DskipTests package

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/pdf-signature-0.1.0.jar app.jar

RUN useradd --system --create-home appuser
USER appuser

EXPOSE 3006
CMD ["java", "-jar", "app.jar"]
