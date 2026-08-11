# SmartClass_Dash

Este é um projeto para visualizarmos informações dos sensores por Arduino UNO.

código no ArduinoIDE:

// Sketch com DHT22 ajustado para o formato esperado pelo dashboard:
// uma linha só, no formato chave:valor,chave:valor

#include <DHT.h>

#define DHTPIN 7
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600); // precisa bater com o baudRate usado no connect() do React
  dht.begin();
  delay(2000); // aguarda o sensor inicializar
}

void loop() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  // se a leitura falhar, simplesmente pula esse ciclo sem imprimir nada
  // (uma linha sem "chave:valor" seria ignorada pelo dashboard mesmo assim,
  // mas assim evitamos mandar lixo pela serial)
  if (isnan(t) || isnan(h)) {
    delay(2000);
    return;
  }

  Serial.print("temp:");
  Serial.print(t);
  Serial.print(",umid:");
  Serial.println(h); // println no último valor, pra fechar a linha

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
