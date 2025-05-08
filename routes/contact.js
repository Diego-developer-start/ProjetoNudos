const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');

// POST /api/contact - Create a new contact message
router.post('/', async (req, res) => {
    try {
        console.log('Recebendo dados do formulário:', req.body);
        const { name, email, phone, subject, message } = req.body;
        
        // Validate required fields
        if (!name || !email || !phone || !subject || !message) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
        }

        // Create new contact
        const contact = new Contact({
            name,
            email,
            phone,
            subject,
            message
        });

        await contact.save();
        console.log('Mensagem salva com sucesso:', contact);
        res.status(201).json({ message: 'Mensagem enviada com sucesso!' });
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({ message: 'Erro ao enviar mensagem', error: error.message });
    }
});

// GET /api/contact - List all contact messages
router.get('/', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json(contacts);
    } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        res.status(500).json({ message: 'Erro ao buscar mensagens', error: error.message });
    }
});

// Listar todos os contatos (apenas admin)
router.get('/', auth, async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Acesso restrito a administradores' });
    }
    try {
        const { status, priority, sort = '-createdAt' } = req.query;
        const query = {};

        if (status) query.status = status;
        if (priority) query.priority = priority;

        const contacts = await Contact.find(query)
            .sort(sort)
            .limit(100);

        res.json({
            success: true,
            count: contacts.length,
            data: contacts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar contatos',
            error: error.message
        });
    }
});

// Buscar contato por ID
router.get('/:id', auth, async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Acesso restrito a administradores' });
    }
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contato não encontrado'
            });
        }
        res.json({
            success: true,
            data: contact
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar contato',
            error: error.message
        });
    }
});

// Atualizar status do contato
router.patch('/:id/status', auth, async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Acesso restrito a administradores' });
    }
    try {
        const { status } = req.body;
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contato não encontrado'
            });
        }

        contact.status = status;
        await contact.save();

        res.json({
            success: true,
            message: 'Status atualizado com sucesso',
            data: contact
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Erro ao atualizar status',
            error: error.message
        });
    }
});

// Atualizar prioridade do contato
router.patch('/:id/priority', auth, async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Acesso restrito a administradores' });
    }
    try {
        const { priority } = req.body;
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contato não encontrado'
            });
        }

        contact.priority = priority;
        await contact.save();

        res.json({
            success: true,
            message: 'Prioridade atualizada com sucesso',
            data: contact
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Erro ao atualizar prioridade',
            error: error.message
        });
    }
});

// Deletar contato
router.delete('/:id', auth, async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Acesso restrito a administradores' });
    }
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);
        
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contato não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Contato deletado com sucesso'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao deletar contato',
            error: error.message
        });
    }
});

module.exports = router;