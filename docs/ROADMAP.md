🗺️ Architektoniczny Plan Działania (Roadmapa)
📍 Faza 8: Moduł Zarządzania Wydarzeniami (Jesteśmy tutaj)
Cel: Umożliwienie promotorom dodawania imprez do systemu.

Co robimy: Budujemy TabEvents.svelte. To potężny formularz (Kreator Wydarzeń) oraz tabela do zarządzania nimi (Data Grid).

Killer Feature: Wymuszony Image Cropper, który nie pozwoli promotorowi wrzucić brzydkiego zdjęcia – system sam zmusi go do wykadrowania plakatu do formatu 4:3 lub 1:1, a następnie wyśle do Supabase Storage.

📍 Faza 9: Silnik Zakupowy (B2C Checkout)
Cel: Imprezowicze muszą móc kupić bilet.

Co robimy: Budujemy cały przepływ koszyka. Użytkownik wchodzi w wydarzenie, wybiera ilość biletów, wpisuje dane i płaci.

Killer Feature: Generowanie unikalnych, kryptograficznie bezpiecznych biletów i zapisywanie ich do tabeli tickets. Przygotowanie pod integrację z operatorem płatności (np. Stripe Test Mode).

📍 Faza 10: Bramka Wejściowa (B2B Scanner)
Cel: Wpuszczanie ludzi na imprezę.

Co robimy: Moduł TabScanner.svelte dla promotorów (lub "Bramkarzy").

Killer Feature: Aplikacja poprosi o dostęp do aparatu w telefonie. Bramkarz skanuje kod QR z telefonu imprezowicza, a aplikacja w ułamek sekundy strzela do Supabase i wyświetla na zielono "WAŻNY" lub na czerwono "WYKORZYSTANY".