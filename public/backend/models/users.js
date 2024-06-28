const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    commune: { type: String, required: true },
    score: { type: Number, default: 0 },
    GoodBottlesCollected: { type: Number, default: 0 }, //Nombre de bouteille pleines collectés
    BadBottlesCollected: { type: Number, default: 0 }, //Nombre de bouteilles froissé collectées
    withdrawal:{ type: Number, default: 0 }, //Correspond à la somme que l'utilisateur à deja retiré (Gain retiré)
    profit:{ type: Number, default: 0 }, //Correspond au gain courant donc la somme que l'utilisateur peut encore retirer (Gain courant)
    accumulation:{ type: Number, default: 0 }, //Correspond à la somme que l'utilisateur à deja empocher jusque là
    date: {type: Date, default: Date.now},
    isAdmin: {type: Boolean, default: false}
});

module.exports = mongoose.model('User', UserSchema);
