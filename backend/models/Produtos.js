const { default: mongoose, Schema } = require("mongoose");

const ProdutoSchema = new Schema({
    name: { type: String, required: true },
    categoria: { type: String, required: true },
    preco: { type: Number, required: true }, // Alterado para Number
    imagem: { type: String, required: true }
});

const ProdutoModel = mongoose.model("products", ProdutoSchema);
module.exports = ProdutoModel;
