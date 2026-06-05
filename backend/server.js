require('dotenv').config()
const express = require('express')
const mysql = require('mysql2')
const cors = require('cors')
const bcrypt = require('bcrypt')
const app = express()
const path = require('path')
const multer = require('multer')
const jwt = require('jsonwebtoken')
// const JWT_SECRET = '6s5d4f4q1s651s3f2ws1f6q1s4df35wsd1fq658sef4'
const JWT_SECRET = process.env.JWT_SECRET
const PORT = process.env.PORT || 3000;
const HOST = process.env.IP || '0.0.0.0'

app.use(express.static(path.join(__dirname, 'dist')))

app.use(cors())
app.post(
  '/webhook-stripe',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const sig = req.headers['stripe-signature']

    let event

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.log('Erreur webhook:', err.message)
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const idCommande = session.metadata.id_commande

      db.query(
        `
        UPDATE commande
        SET statut = 'en cours',
            est_valide = 1
        WHERE id_commande = ?
        `,
        [idCommande],
        (err) => {
          if (err) console.log(err)
        }
      )
    }

    res.json({ received: true })
  }
)
console.log(process.env.STRIPE_SECRET_KEY)
app.use(express.json())
app.use('/uploads',
  express.static(path.join(__dirname, 'uploads'))
)

// CONFIG MULTER
const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },

  filename: (req, file, cb) => {

    const uniqueName =
      Date.now() + path.extname(file.originalname)

    cb(null, uniqueName)
  }

})

const upload = multer({ storage })

// CONNEXION MYSQL
// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'hellogastro'
// })
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});

db.connect((err) => {
  if (err) {
    console.log(err)
  } else {
    console.log('MySQL connecté')
  }
})

// // ROUTE TEST
// app.get('/', (req, res) => {
//   res.send('API HelloGastro')
// })

// ROUTE PLATS
app.get('/plats', (req, res) => {

  const sql = 'SELECT * FROM plat WHERE actif = 1'

  db.query(sql, (err, result) => {

    if (err) {
      res.status(500).json(err)
    } else {
      res.json(result)
    }

  })

})
app.post('/upload', upload.single('image'), (req, res) => {
  res.json({
    imageUrl: `${process.env.API_URL}/uploads/${req.file.filename}`
  })

}
)
app.post('/register', async (req, res) => {

  const {
    id,
    email,
    postal,
    password,
    tel,
    prenom,
    nom
  } = req.body

  try {

    const hashedPassword = await bcrypt.hash(password, 10)

    const sql = `
      INSERT INTO utilisateur
      (
        identifiant,
        adr_mail,
        adr_postale,
        mdp,
        num_tel_utilisateur,
        prenom,
        nom,
        role
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'user')
    `

    db.query(sql, [id, email, postal, hashedPassword, tel, prenom, nom], (err, result) => {
      if (err) {
        res.status(500).json(err)
      } else {
        res.json({
          message: 'Utilisateur créé'
        })
      }

    }
    )

  } catch (error) {
    res.status(500).json(error)
  }

})
app.post('/login', (req, res) => {

  const { email, password } = req.body

  const sql = `
    SELECT * FROM utilisateur
    WHERE adr_mail = ?
  `

  db.query(sql, [email], async (err, result) => {

    if (err) {
      return res.status(500).json(err)
    }

    if (result.length === 0) {
      return res.status(401).json({
        message: 'Utilisateur introuvable'
      })
    }

    const user = result[0]

    const validPassword = await bcrypt.compare(
      password,
      user.mdp
    )

    if (!validPassword) {
      return res.status(401).json({
        message: 'Mot de passe incorrect'
      })
    }

    const token = jwt.sign(
      {
        id: user.id_utilisateur,
        role: user.role
      },
      JWT_SECRET,
      {
        expiresIn: '2h'
      }
    )

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id_utilisateur,
        prenom: user.prenom,
        nom: user.nom,
        email: user.adr_mail,
        role: user.role
      }
    })

  })

})

app.get('/mes-commandes', verifyToken, (req, res) => {

  const idUtilisateur = req.user.id

  const sql = `
    SELECT *
    FROM commande
    WHERE id_utilisateur = ?
    ORDER BY date_commande DESC
  `

  db.query(sql, [idUtilisateur], (err, result) => {

    if (err) {
      return res.status(500).json(err)
    }

    res.json(result)

  })

})
app.get('/mes-commandes/:id', verifyToken, (req, res) => {

  const idUtilisateur = req.user.id
  const idCommande = req.params.id

  const sql = `
    SELECT 
      c.id_commande,
      c.date_commande,
      c.statut,
      p.libel_plat,
      p.prix_plat,
      lc.qte,
      (p.prix_plat * lc.qte) AS total_ligne
    FROM commande c
    JOIN ligne_commande lc ON c.id_commande = lc.id_commande
    JOIN plat p ON p.id_plat = lc.id_plat
    WHERE c.id_commande = ?
    AND c.id_utilisateur = ?
  `

  db.query(sql, [idCommande, idUtilisateur], (err, result) => {

    if (err) {
      return res.status(500).json(err)
    }

    res.json(result)

  })

})
app.post('/commande', verifyToken, (req, res) => {

  const { items } = req.body
  const id_utilisateur = req.user.id

  const sqlCommande = `
    INSERT INTO commande
    (
      est_valide,
      date_commande,
      id_utilisateur
    )
    VALUES
    (
      1,
      NOW(),
      ?
    )
  `

  db.query(
    sqlCommande,
    [id_utilisateur],
    (err, result) => {

      if (err) {

        return res.status(400).json({
          message: err.sqlMessage
        })

      }

      const idCommande = result.insertId

      let compteur = 0

      items.forEach(item => {
        const sqlLigne = `
          INSERT INTO ligne_commande
          (
            qte,
            id_commande,
            id_plat
          )
          VALUES (?, ?, ?)
        `

        db.query(
          sqlLigne,
          [
            item.quantity,
            idCommande,
            item.id_plat
          ],
          (err) => {

            if (err) {
              return res.status(500).json(err)
            }

            compteur++

            if (compteur === items.length) {

              res.json({
                message: 'Commande enregistrée'
              })

            }

          }
        )

      })

    }
  )

})
app.get('/commandes/:idUtilisateur', (req, res) => {

  const sql = `
    SELECT *
    FROM commande
    WHERE id_utilisateur = ?
    ORDER BY date_commande DESC
  `

  db.query(sql, [req.params.idUtilisateur], (err, result) => {

    if (err) {
      return res.status(500).json(err)
    }

    res.json(result)

  })

})
app.get('/commande/:id', (req, res) => {

  const sql = `
    SELECT 
      c.id_commande,
      c.date_commande,
      p.libel_plat,
      p.prix_plat,
      lc.qte,
      (p.prix_plat * lc.qte) AS total_ligne,
      statut
    FROM commande c
    JOIN ligne_commande lc ON c.id_commande = lc.id_commande
    JOIN plat p ON p.id_plat = lc.id_plat
    WHERE c.id_commande = ?
  `

  db.query(sql, [req.params.id], (err, result) => {

    if (err) {
      return res.status(500).json(err)
    }

    res.json(result)

  })

})
app.get('/plats', verifyToken, isAdmin, (req, res) => {
  db.query('SELECT * FROM plat WHERE actif = 1', (err, result) => {
    res.json(result)
  })
})
// ajouter
app.post('/admin/plats', verifyToken, isAdmin, (req, res) => {

  const {
    libel_plat,
    prix_plat,
    description,
    image,
    ingredients,
    id_type
  } = req.body

  const sqlPlat = `
    INSERT INTO plat
    (
      libel_plat,
      prix_plat,
      description,
      image,
      id_type
    )
    VALUES (?, ?, ?, ?, ?)
  `

  db.query(
    sqlPlat,
    [
      libel_plat,
      prix_plat,
      description,
      image,
      id_type
    ],
    (err, result) => {

      if (err) {
        console.log('ERREUR INSERT PLAT', err)
        return res.status(500).json(err)
      }

      const platId = result.insertId

      if (!Array.isArray(ingredients) || ingredients.length === 0) {
        return res.json({
          message: 'Plat ajouté sans ingrédient'
        })
      }

      const values = ingredients.map(i => [
        platId,
        i.id_ingredient,
        i.qte_ingredient
      ])

      db.query(
        `
        INSERT INTO composer
        (
          id_plat,
          id_ingredient,
          qte_ingredient
        )
        VALUES ?
        `,
        [values],
        (err2) => {

          if (err2) {
            console.log('ERREUR INSERT COMPOSER', err2)
            return res.status(500).json(err2)
          }

          res.json({
            message: 'Plat ajouté'
          })

        }
      )

    }
  )

})
// modifier
app.put('/admin/plats/:id', verifyToken, isAdmin, (req, res) => {

  const {
    libel_plat,
    prix_plat,
    description,
    image,
    ingredients,
    id_type
  } = req.body

  const id = req.params.id

  // const safeIdType = id_type[0].id_type
  const safeIdType =
    id_type === '' || id_type === undefined || id_type === null
      ? null
      : Number(id_type)

  console.log('BODY UPDATE:', req.body)
  console.log('safeIdType:', safeIdType)

  const sql = `
    UPDATE plat
    SET libel_plat = ?, prix_plat = ?, description = ?, image = ?, id_type = ?
    WHERE id_plat = ?
  `

  db.query(sql, [libel_plat, prix_plat, description, image, safeIdType, id], (err) => {

    if (err) return res.status(500).json(err)

    // 1. supprimer anciennes liaisons
    db.query(
      'DELETE FROM composer WHERE id_plat = ?',
      [id],
      (err2) => {

        if (err2) return res.status(500).json(err2)

        // 2. réinsérer nouvelles liaisons
        if (Array.isArray(ingredients) && ingredients.length > 0) {

          const values = ingredients.map(i => [
            id,
            i.id_ingredient,
            i.qte_ingredient
          ])

          db.query(`INSERT INTO composer(id_plat, id_ingredient, qte_ingredient)VALUES ?`, [values], (err3) => {
            if (err3) return res.status(500).json(err3)

            res.json({ message: 'Plat modifié' })
          }
          )

        } else {
          res.json({ message: 'Plat modifié sans ingrédient' })
        }

      }
    )

  })

})

// suprimer (plat plus afficher => conserver l'historique des commande)
app.delete('/admin/plats/:id', verifyToken, isAdmin, (req, res) => {

  const id = req.params.id

  const sql = `
    UPDATE plat
    SET actif = 0
    WHERE id_plat = ?
  `

  db.query(sql, [id], (err) => {
    if (err) {
      console.log(err)
      return res.status(500).json(err)
    }

    res.json({ message: 'Plat désactivé' })
  })
})
app.get('/admin/commandes', verifyToken, isAdmin, (req, res) => {

  const sql = `
    SELECT 
      c.id_commande,
      c.date_commande,
      c.est_valide,
      u.prenom,
      u.nom,
      u.adr_mail,
      u.num_tel_utilisateur,
      u.adr_postale,
      c.statut
    FROM commande c
    JOIN utilisateur u 
      ON c.id_utilisateur = u.id_utilisateur
    ORDER BY c.date_commande DESC
  `

  db.query(sql, (err, result) => {

    if (err) return res.status(500).json(err)

    res.json(result)

  })

})
// detail
app.get('/admin/commande/:id', verifyToken, isAdmin, (req, res) => {

  const sql = `
    SELECT 
      c.id_commande,
      c.date_commande,
      p.libel_plat,
      p.prix_plat,
      lc.qte,
      (p.prix_plat * lc.qte) AS total_ligne,
      statut
    FROM commande c
    JOIN ligne_commande lc ON c.id_commande = lc.id_commande
    JOIN plat p ON p.id_plat = lc.id_plat
    WHERE c.id_commande = ?
  `

  db.query(sql, [req.params.id], (err, result) => {

    if (err) return res.status(500).json(err)

    res.json(result)

  })

})
app.get('/admin/stats', verifyToken, isAdmin, (req, res) => {

  const sql = `
    SELECT
      COUNT(*) AS total_commandes,

      SUM(CASE WHEN statut='en cours' THEN 1 ELSE 0 END) AS en_cours,

      SUM(CASE WHEN statut='préparée' THEN 1 ELSE 0 END) AS preparees,

      SUM(CASE WHEN statut='livrée' THEN 1 ELSE 0 END) AS livrees,

      SUM(CASE WHEN statut='annulée' THEN 1 ELSE 0 END) AS annulees

    FROM commande
  `

  db.query(sql, (err, result) => {

    if (err) {
      return res.status(500).json(err)
    }

    res.json(result[0])

  })

})

app.put('/admin/commande/:id/statut', verifyToken, isAdmin, (req, res) => {

  const { statut } = req.body

  const id = req.params.id

  const sql = `
    UPDATE commande
    SET statut = ?
    WHERE id_commande = ?
  `

  db.query(sql, [statut, id], (err, result) => {

    if (err) {
      return res.status(500).json(err)
    }

    res.json({
      message: 'Statut mis à jour'
    })

  })

})

app.get('/ingredients', (req, res) => {

  const sql = `
    SELECT *
    FROM ingredient
    ORDER BY libel_ingredient
  `

  db.query(sql, (err, result) => {

    if (err) {
      return res.status(500).json(err)
    }

    res.json(result)

  })

})
// select ingrédients
app.get('/admin/ingredients', verifyToken, isAdmin, (req, res) => {

  const sql = `
    SELECT *
    FROM ingredient
    ORDER BY libel_ingredient
  `

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err)

    res.json(result)
  })
})
// ajouter ingrédients
app.post('/admin/ingredients', verifyToken, isAdmin, (req, res) => {

  const { libel_ingredient, stock, allergenes } = req.body

  const sql = `
    INSERT INTO ingredient
    (libel_ingredient, stock)
    VALUES (?, ?)
  `

  db.query(sql, [libel_ingredient, stock], (err, result) => {
    if (err) return res.status(500).json(err)

    const ingredientId = result.insertId

    if (!Array.isArray(allergenes) || allergenes.length === 0) {
      return res.json({ message: 'Ingrédient ajouté sans allergène' })
    }

    const values = allergenes.map(id_allergene => [
      ingredientId,
      id_allergene
    ])

    db.query(
      'INSERT INTO contenir (id_ingredient, id_allergene) VALUES ?',
      [values],
      (err2) => {
        if (err2) return res.status(500).json(err2)

        res.json({ message: 'Ingrédient ajouté' })
      }
    )
  })
})
// modifier ingrédients
app.put('/admin/ingredients/:id', verifyToken, isAdmin, (req, res) => {

  const { libel_ingredient, stock, allergenes } = req.body

  const sql = `
    UPDATE ingredient
    SET libel_ingredient = ?, stock = ?
    WHERE id_ingredient = ?
  `

  db.query(
    sql,
    [libel_ingredient, stock, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err)

      db.query(
        'DELETE FROM contenir WHERE id_ingredient = ?',
        [req.params.id],
        (err2) => {
          if (err2) return res.status(500).json(err2)

          if (!Array.isArray(allergenes) || allergenes.length === 0) {
            return res.json({ message: 'Ingrédient modifié sans allergène' })
          }

          const values = allergenes.map(id_allergene => [
            req.params.id,
            id_allergene
          ])

          db.query(
            'INSERT INTO contenir (id_ingredient, id_allergene) VALUES ?',
            [values],
            (err3) => {
              if (err3) return res.status(500).json(err3)

              res.json({ message: 'Ingrédient modifié' })
            }
          )
        }
      )
    }
  )
})
// Supprimer ingrédients
app.delete('/admin/ingredients/:id', verifyToken, isAdmin, (req, res) => {

  const id = req.params.id

  db.query('DELETE FROM composer WHERE id_ingredient = ?', [id], (err1) => {
    if (err1) return res.status(500).json(err1)

    db.query('DELETE FROM contenir WHERE id_ingredient = ?', [id], (err2) => {
      if (err2) return res.status(500).json(err2)

      db.query('DELETE FROM ingredient WHERE id_ingredient = ?', [id], (err3) => {
        if (err3) return res.status(500).json(err3)

        res.json({ message: 'Ingrédient supprimé' })
      })
    })
  })
})
app.get('/types-plat', (req, res) => {

  db.query(
    'SELECT * FROM type_plat',
    (err, result) => {

      if (err) {
        return res.status(500).json(err)
      }

      res.json(result)

    }
  )

})
app.get('/admin/plats/:id/ingredients', verifyToken, isAdmin, (req, res) => {

  const sql = `
    SELECT 
      id_ingredient,
      qte_ingredient
    FROM composer
    WHERE id_plat = ?
  `

  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err)

    res.json(result)
  })
})
app.get('/plats-with-allergenes', (req, res) => {

  const sql = `
    SELECT 
      p.id_plat,
      p.libel_plat,
      p.prix_plat,
      p.description,
      p.image,
      a.libel_allergene,
      p.id_type,
      t.libel_type,

      CASE
        WHEN NOT EXISTS (
          SELECT 1
          FROM composer c0
          WHERE c0.id_plat = p.id_plat
        )
        THEN 0

        WHEN EXISTS (
          SELECT 1
          FROM composer c2
          JOIN ingredient i2 ON c2.id_ingredient = i2.id_ingredient
          WHERE c2.id_plat = p.id_plat
          AND i2.stock < c2.qte_ingredient
        )
        THEN 0

        ELSE 1
      END AS disponible

    FROM plat p
    LEFT JOIN composer c ON p.id_plat = c.id_plat
    LEFT JOIN ingredient i ON c.id_ingredient = i.id_ingredient
    LEFT JOIN contenir co ON i.id_ingredient = co.id_ingredient
    LEFT JOIN allergene a ON co.id_allergene = a.id_allergene
    LEFT JOIN type_plat t ON p.id_type = t.id_type

    WHERE p.actif = 1
  `

  db.query(sql, (err, rows) => {

    if (err) return res.status(500).json(err)

    const platsMap = {}

    rows.forEach(row => {

      if (!platsMap[row.id_plat]) {
        platsMap[row.id_plat] = {
          id_plat: row.id_plat,
          libel_plat: row.libel_plat,
          prix_plat: row.prix_plat,
          description: row.description,
          image: row.image,
          disponible: row.disponible,
          allergenes: [],
          id_type: row.id_type,
          libel_type: row.libel_type,
        }
      }

      if (
        row.libel_allergene &&
        !platsMap[row.id_plat].allergenes.includes(row.libel_allergene)
      ) {
        platsMap[row.id_plat].allergenes.push(row.libel_allergene)
      }

    })

    res.json(Object.values(platsMap))
  })
})
app.get('/admin/allergenes', verifyToken, isAdmin, (req, res) => {
  db.query('SELECT * FROM allergene ORDER BY libel_allergene', (err, result) => {
    if (err) return res.status(500).json(err)

    res.json(result)
  })
})
app.get('/admin/ingredients/:id/allergenes', verifyToken, isAdmin, (req, res) => {
  db.query(
    'SELECT id_allergene FROM contenir WHERE id_ingredient = ?',
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json(err)

      res.json(result)
    }
  )
})

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

app.post('/api/create-checkout-session', verifyToken, async (req, res) => {
  try {
    const { cart } = req.body
    const id_utilisateur = req.user.id

    if (!cart || cart.length === 0) {
      return res.status(400).json({ message: 'Panier vide' })
    }

    const sqlCommande = `
      INSERT INTO commande
      (est_valide, date_commande, id_utilisateur, statut)
      VALUES (0, NOW(), ?, 'en attente paiement')
    `

    db.query(sqlCommande, [id_utilisateur], async (err, result) => {
      if (err) return res.status(500).json(err)

      const idCommande = result.insertId

      const values = cart.map(item => [
        item.quantity,
        idCommande,
        item.id_plat
      ])

      db.query(
        `INSERT INTO ligne_commande (qte, id_commande, id_plat) VALUES ?`,
        [values],
        async (err2) => {
          if (err2) return res.status(500).json(err2)

          const line_items = cart.map(item => ({
            price_data: {
              currency: 'eur',
              product_data: {
                name: item.libel_plat
              },
              unit_amount: Math.round(Number(item.prix_plat) * 100)
            },
            quantity: item.quantity
          }))
          console.log('PANIER REÇU STRIPE =', cart)
          const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items,

            success_url: `${process.env.CLIENT_URL}?page=success`,
            cancel_url: `${process.env.CLIENT_URL}?page=cart`,

            metadata: {
              id_commande: String(idCommande)
            }
          })
          console.log('SESSION CRÉÉE =', session.id)

          res.json({ url: session.url })
        }
      )
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur Stripe' })
  }
})





function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Accès refusé'
    })
  }

  next()
}
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({
      message: 'Token manquant'
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET)

    req.user = decoded

    next()
  } catch (error) {
    return res.status(401).json({
      message: 'Token invalide'
    })
  }
}



app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})
app.listen(PORT, HOST, () => {
  console.log(`Serveur lancé sur ${HOST}:${PORT}`)
})