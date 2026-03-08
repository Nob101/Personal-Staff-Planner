-- Arbeitstyp in seed file ausgelagert
-- darf erst geladen werden, wenn tabellen existieren


INSERT INTO arbeitstyp (akurzl, text) VALUES
    ('A', 'Anfangsdienst'),
     ('E', 'Enddienst'),
      ('F', 'Frei'),
       ('K', 'Krankenstand'),
        ('U', 'Urlaub')
    on CONFLICT (akurzl) DO NOTHING;












    --Hola