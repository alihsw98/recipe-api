const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/recipeApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB', err);
});

// Recipe Model
const Recipe = mongoose.model('Recipe', {
    name: String,
    description: String,
    ingredients: [String],
    instructions: [String],
    image: String,
    prepTime: Number,
    ratings: [
        {
            rating: Number,
            comment: String,
        },
    ],
    nutrition: {
        calories: Number,
        protein: String,
        fat: String,
        carbohydrates: String,
        fiber: String,
        sugar: String,
    },
});

// Routes
// Get all recipes
app.get('/recipes', async (req, res) => {
    try {
        const recipes = await Recipe.find().lean(); // Use .lean() for plain JavaScript objects
        const transformedRecipes = recipes.map(recipe => {
            return {
                ...recipe,
                id: recipe._id,
                _id: undefined, // Remove _id
            };
        });
        res.json(transformedRecipes);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get a specific recipe by ID
app.get('/recipes/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id).lean();
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.json({
            ...recipe,
            id: recipe._id,
            _id: undefined, // Remove _id
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Create a new recipe
app.post('/recipes', async (req, res) => {
    const {
      name,
      description,
      ingredients,
      instructions,
      image,
      prepTime,
      nutrition,
    } = req.body;
  
    const newRecipe = new Recipe({
      name,
      description,
      ingredients,
      instructions,
      image,
      prepTime,
      nutrition,
    });
  
    try {
      const savedRecipe = await newRecipe.save();
      res.status(201).json(savedRecipe);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  

// Update an existing recipe
app.put('/recipes/:id', async (req, res) => {
    try {
        const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedRecipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.json(updatedRecipe);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a recipe
app.delete('/recipes/:id', async (req, res) => {
    try {
        const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
        if (!deletedRecipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.json({ message: 'Recipe deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Add a rating and comment to a recipe
app.post('/recipes/:id/rate', async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
        return res.status(400).json({ message: 'Rating and comment are required' });
    }

    try {
        const recipe = await Recipe.findById(id);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Add the rating and comment (assuming recipe has a 'ratings' field)
        if (!recipe.ratings) {
            recipe.ratings = [];
        }

        recipe.ratings.push({ rating, comment });

        await recipe.save();
        res.status(200).json({ message: 'Rating and comment added successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
