const express = require('express')
const { default: mongoose } = require('mongoose')
const cors = require('cors')
const multer = require('multer')
const fs = require("fs");
const path = require('path')


const UserModel = require('./models/Usuario');
const ProdutoModel = require('./models/Produtos');


const app = express()
const port = 3001

mongoose.connect('mongodb://localhost:27017/SeuBancoDeDados')

app.use(cors({ origin: "http://localhost:3000" })); // Ajuste a porta conforme necessário
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

//  CONFIGURACAO APRA SALVAR A IMAGEM 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, "uploads");
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath);
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Nome único para o arquivo
    }
});

const upload = multer({storage})


app.post('/register', (req,res)=>{
    UserModel.create(req.body)
    .then(users => res.json(users))
    .catch(err => res.json(err))
})

app.post('/login', (req,res)=>{
    const {email,password} = req.body
    UserModel.findOne({email: email})
    .then(user => {
        if(user){
            if(user.password === password){
                res.json({success: true, name: user.name})
            }else{
                res.json({success: false, message: "A senha está incorreta!"})
            }
        }else{
            res.json({success: false, message: "Nenhum usuário encontrado!"})
        }
    })
})

app.post("/Add_Produto", upload.single("imagem"), async (req, res) => {
    try {
        const { name, categoria, preco } = req.body;
        const imagem = req.file ? `/uploads/${req.file.filename}` : "";

        const novoProduto = new ProdutoModel({ name, categoria, preco, imagem });
        await novoProduto.save();

        res.status(201).json({ message: "Produto adicionado com sucesso", produto: novoProduto });
    } catch (error) {
        res.status(500).json({ message: "Erro ao adicionar produto", error });
    }
});

app.get('/Get_Produto', async (req, res)=>{
    try {
        const produtos = await ProdutoModel.find()
        res.status(201).json(produtos)
    } catch (error) {
        res.status(500).json({message: "Erro ao buscar o produto: ", error})

    }
})

app.get('/Get_Produto/:id', async (req, res)=>{
    try {
        const produtos = await ProdutoModel.findById(req.params.id)
        if(!produtos){
            res.status(404).json({message: "Produto não encontrado! "})
        }else{
            res.status(201).json(produtos)
        }
    } catch (error) {
        res.status(500).json({message: "Erro ao buscar o produto: ", error})

    }
})



app.listen(port, () => console.log(`Example app listening on port ${port}!`))
