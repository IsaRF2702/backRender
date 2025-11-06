//ESSA AQUI É DEDICADA AOS USUÁRIOS

import express from "express";
import sql from "./database.js"
import { CompararHash, CriarHash } from "./utilits.js";

const routes = express.Router()

routes.post('/login', async (req, res) => {
try{ 
    const { email, senha } = req.body
    let user = await sql`select 
    * from people where email=${email}`

    const teste = await CompararHash(senha, user[0].senha)
    
    if(teste) {
        return res.status(200).json(user[0])
    }
    else {
        return res.status(401).json('Usuario ou senha incorreto!')
    }
}
   
    catch(error){
        return res.status(500).json('Erro de servidor')
    }
})

routes.post('/cadastrar', async (req, res) => {
    try{
    const { email, senha } = req.body
    const hash = await CriarHash(senha, 10)
    console.log('To aqui')
    await sql`INSERT INTO people(email, senha, funcao) values (${email}, ${hash},'cliente')`
    return res.status(200).json('cadastrado com sucesso')

}
    catch(error){
        return res.status(500).json('Erro de Servidor')
    }
})

// DEDICADA AO CADASTRO DE CASAS

routes.get('/imovel/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const casa = await sql`SELECT * FROM imovel WHERE id_imovel = ${id}`;

        if (casa.length === 0) {
            return res.status(404).json({ mensagem: 'Casa não encontrada.' });
        }

        return res.status(200).json(casa[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao buscar a casa.' });
    }
});

routes.get('/imoveis', async (req, res) => {
  try {
    const { busca, tipo_moradia, finalidade, preco_maximo, preco_minimo } = req.query;

    // start with a fragment that always exists
    let where = sql`WHERE 1=1`;

    // helper to escape % and _ in user input for LIKE
    const escapeLike = s => String(s).replace(/([%_\\])/g, '\\$1');

    if (busca) {
      const pattern = `%${escapeLike(busca)}%`;
      // use ILIKE for case-insensitive match and ESCAPE '\\' because we escaped
      where = sql`${where} AND nome_casa ILIKE ${pattern} ESCAPE '\\'`;
    }

    if (tipo_moradia) {
      where = sql`${where} AND tipo_moradia = ${String(tipo_moradia)}`;
    }

    if (finalidade) {
      where = sql`${where} AND finalidade = ${String(finalidade)}`;
    }

    if (preco_minimo) {
      const min = Number(preco_minimo);
      if (!Number.isNaN(min)) where = sql`${where} AND preco >= ${min}`;
    }

    if (preco_maximo) {
      const max = Number(preco_maximo);
      if (!Number.isNaN(max)) where = sql`${where} AND preco <= ${max}`;
    }

    const results = await sql`SELECT * FROM imovel ${where}`;
    return res.status(200).json(results);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
});



routes.post('/imovel/cadastrar', async (req, res) => {
    try {
        const { nome_casa,tipo_moradia,finalidade,preco,rua,bairro,numero,cidade,estado,area_total,quartos,banheiros,vagas_garagem,disponibilidade
        } = req.body;

        await sql`
  INSERT INTO imovel (
    nome_casa,
    tipo_moradia, 
    finalidade, 
    preco, 
    rua,
    bairro,
    numero,
    cidade,
    estado,
    area_total, 
    quartos, 
    banheiros, 
    vagas_garagem,
    disponibilidade
  ) VALUES (
    ${nome_casa},
    ${tipo_moradia}, 
    ${finalidade}, 
    ${preco}, 
    ${rua},
    ${bairro},
    ${numero},
    ${cidade},
    ${estado}, 
    ${area_total}, 
    ${quartos}, 
    ${banheiros}, 
    ${vagas_garagem},
    ${disponibilidade}
  )`;

        return res.status(200).json('Deu certinho aqui!!!');
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao cadastrar a casa.' });
    }
});

routes.put('/imovel/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nome_casa,
            tipo_moradia,
            finalidade,
            preco,
            rua,
            bairro,
            numero,
            cidade,
            estado,
            area_total,
            quartos,
            banheiros,
            vagas_garagem,
            disponibilidade
        } = req.body;

        const update = await sql`
            UPDATE imovel SET
                nome_casa = ${nome_casa},
                tipo_moradia = ${tipo_moradia},
                finalidade = ${finalidade},
                preco = ${preco},
                rua = ${rua},
                bairro = ${bairro},
                numero = ${numero},
                cidade = ${cidade},
                estado = ${estado},
                area_total = ${area_total},
                quartos = ${quartos},
                banheiros = ${banheiros},
                vagas_garagem = ${vagas_garagem},
                disponibilidade = ${disponibilidade}
            WHERE id_imovel = ${id}
        `;

        return res.status(200).json({ mensagem: 'Casa atualizada com sucesso.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao atualizar a casa.' });
    }
});

routes.delete('/imovel/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await sql`DELETE FROM imovel WHERE id_imovel = ${id}`;

        return res.status(200).json({ mensagem: 'Casa excluída com sucesso.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao excluir a casa.' });
    }
});

//CADASTRO DE IMAGEM DAS CASAS

routes.post('/fotos_casa', async (req, res) =>{
    try{
        //criar campo data como bytea
        await sql`
        insert into fotos_casa(nome, mimetype, data) 
        values(${req.body.nome}, ${req.body.mimetype}, decode(${req.body.data}, 'base64'))`;
        return res.status(201).json('ok')
    }
    catch(error){
        console.log(error)
        return res.status(500).json('Erro ao inserir fotos')
    }
})

routes.get('/fotos_casa', async (req, res) =>{
    try {
        const imagens = await sql`select * from fotos_casa`
        return res.status(200).json(imagens)
    } catch (error) {
        console.log(error)
        return res.status(500).json('Erro ao encontrar imagens')
    }
})

export default routes