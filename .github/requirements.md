# Book Collection Management App - Ember.js + TypeScript + Tailwind

## Kontekst
Tworzona aplikacja to **Book Collection Management App** do zarządzania kolekcją książek. Celem projektu jest umożliwienie użytkownikowi:
- Dodawania, edytowania i usuwania książek.
- Przeglądania listy książek.
- Filtrowania książek według kategorii.

Aplikacja będzie używana do badań porównawczych w pracy magisterskiej nad frameworkami front-endowymi.

## Stack technologiczny
- **Ember.js** (z szablonem **TypeScript**) - framework aplikacji.
- **Ember Data** - zarządzanie stanem aplikacji.
- **Tailwind CSS** - stylowanie komponentów.
- **Handlebars (HBS)** - szablony.

## Wymagania funkcjonalne

### 1. Książki
- Dodawanie nowej książki:
  - Tytuł (string)
  - Autor (string)
  - Rok wydania (number)
  - Kategoria (string)

- Edytowanie istniejącej książki
- Usuwanie książki

### 2. Lista książek
- Wyświetlanie listy wszystkich książek
- Filtrowanie książek wg kategorii
- Sortowanie po tytule lub roku

## Wymagania niefunkcjonalne
- Responsywność (działanie również na telefonach)
- Dobre praktyki TypeScript
- Czytelna struktura kodu
- Stylowanie Tailwind CSS
- Czytelna i spójna struktura projektu

## Co musi zostać przygotowane
- Konfiguracja Tailwind CSS
- Konfiguracja Ember Data
- Typy danych dla książek
- Komponenty: formularze, lista książek, filtr
- Routing pomiędzy stronami
- Implementacja dodawania, edytowania i usuwania książek
- Stylowanie Tailwind CSS

## Development scripts
```bash
ember serve       # uruchamia projekt
ember build       # buduje projekt do produkcji
ember test        # uruchamia testy
```

---

# Notatki dla Copilota
- Framework: **Ember.js** (z **TypeScript**)
- Stylowanie: **Tailwind CSS**
- Zarządzanie stanem: **Ember Data**
- Wszystkie komponenty mają być czytelne i podzielone
- Kod ma być przejrzysty, rozdzielony na małe komponenty

# Cel końcowy
Gotowa aplikacja do zarządzania kolekcją książek, która posłuży jako benchmark do badań nad wydajnością i ergonomią użycia frameworków JavaScript w pracy magisterskiej.