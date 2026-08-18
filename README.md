# SmartClass_Dash

Este é um projeto para visualizarmos informações dos sensores por Arduino UNO.

código no ArduinoIDE:

// Sketch com DHT22 ajustado para o formato esperado pelo dashboard:
// uma linha só, no formato chave:valor,chave:valor
// Biblioteca do Arduino IDE: DHT sensor library by Adafruit
#include <DHT.h>

#define DHTPIN 7
#define DHTTYPE DHT22
#define LDRPIN A0

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
  delay(2000);
}

void loop() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  // Leitura do LDR: 0 a 1023
  int luz = analogRead(LDRPIN);

  // Se o DHT22 falhar, não envia a leitura desse ciclo
  if (isnan(t) || isnan(h)) {
    delay(2000);
    return;
  }

  // Formato esperado pelo dashboard:
  // temp:25.3,umid:60.2,luz:512
  Serial.print("temp:");
  Serial.print(t);

  Serial.print(",umid:");
  Serial.print(h);

  Serial.print(",luz:");
  Serial.println(luz);

  delay(2000);
}
___________________________________________________________________________________________________

1. No Arduino:
Feche o Serial Monitor do Arduino IDE antes de conectar pelo dashboard — só um programa pode usar a porta serial por vez.
Use o sketch de exemplo (arduino_exemplo.ino) como base, mandando os dados no formato chave:valor,chave:valor.
Se seus sensores tiverem nomes diferentes de temp, umid, luz, ajuste o objeto LABELS em SensorCard.jsx e SERIES_COLORS em Dashboard.jsx.
___________________________________________________________________________________________________

2. No dashboard:
Clique em "Conectar porta serial".
O navegador vai abrir um seletor pedindo pra escolher a porta USB do Arduino.
Escolha a porta e pronto — os dados começam a aparecer em tempo real.
