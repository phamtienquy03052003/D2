
import fs from 'fs';


const STOPWORDS = new Set([
    'là', 'và', 'của', 'thì', 'mà', 'ở', 'với', 'những', 'các', 'như', 'khi', 'do', 'để', 'này', 'đó'
]);

class CustomBayes {
    constructor() {
        this.tokenCounts = {}; 
        this.classCounts = {}; 
        this.vocabulary = new Set();
        this.totalDocs = 0;
    }

    
    tokenize(text) {
        if (!text) return [];

        
        const rawTokens = text.toLowerCase()
            .replace(/[.,;:"'?!()\-]+/g, ' ') // Remove punctuation
            .split(/\s+/)
            .filter(t => t.length > 0 && !STOPWORDS.has(t));

        const tokens = [];

        // 2. Generate Unigrams
        rawTokens.forEach(t => tokens.push(t));

        // 3. Generate Bigrams (N-grams) for context
        // "giết" -> "giết_người", "lừa" -> "lừa_đảo"
        for (let i = 0; i < rawTokens.length - 1; i++) {
            tokens.push(`${rawTokens[i]}_${rawTokens[i + 1]}`);
        }

        return tokens;
    }

    
    train(text, label) {
        if (!this.classCounts[label]) {
            this.classCounts[label] = 0;
            this.tokenCounts[label] = {};
        }

        this.classCounts[label]++;
        this.totalDocs++;

        const tokens = this.tokenize(text);

        
        tokens.forEach(token => {
            this.vocabulary.add(token);
            if (!this.tokenCounts[label][token]) {
                this.tokenCounts[label][token] = 0;
            }
            this.tokenCounts[label][token]++;
        });
    }

    
    prune(minFreq = 3) {
        console.log(`Pruning vocabulary (minFreq=${minFreq})...`);
        const initialVocabSize = this.vocabulary.size;

        
        const globalFreq = {};

        Object.keys(this.tokenCounts).forEach(label => {
            const labelTokens = this.tokenCounts[label];
            Object.keys(labelTokens).forEach(token => {
                globalFreq[token] = (globalFreq[token] || 0) + labelTokens[token];
            });
        });

        
        const tokensToRemove = new Set();
        Object.keys(globalFreq).forEach(token => {
            if (globalFreq[token] < minFreq) {
                tokensToRemove.add(token);
            }
        });

        
        tokensToRemove.forEach(token => {
            this.vocabulary.delete(token);
            Object.keys(this.tokenCounts).forEach(label => {
                if (this.tokenCounts[label][token]) {
                    delete this.tokenCounts[label][token];
                }
            });
        });

        console.log(`Pruned ${tokensToRemove.size} tokens. Vocab size: ${initialVocabSize} -> ${this.vocabulary.size}`);
    }

    
    classify(text) {
        const tokens = this.tokenize(text);
        let maxProb = -Infinity;
        let bestLabel = null;

        Object.keys(this.classCounts).forEach(label => {
            
            let logProb = Math.log(this.classCounts[label] / this.totalDocs);

            
            const labelTokenCounts = this.tokenCounts[label];
            const totalTokensInLabel = Object.values(labelTokenCounts).reduce((a, b) => a + b, 0);
            const vocabSize = this.vocabulary.size;

            tokens.forEach(token => {
                if (this.vocabulary.has(token)) {
                    
                    const count = labelTokenCounts[token] || 0;
                    
                    logProb += Math.log((count + 1) / (totalTokensInLabel + vocabSize));
                }
            });

            if (logProb > maxProb) {
                maxProb = logProb;
                bestLabel = label;
            }
        });

        return bestLabel || 'clean'; 
    }

    toJSON() {
        return {
            classCounts: this.classCounts,
            tokenCounts: this.tokenCounts,
            vocabulary: Array.from(this.vocabulary),
            totalDocs: this.totalDocs
        };
    }

    static fromJSON(json) {
        const bayes = new CustomBayes();
        bayes.classCounts = json.classCounts || {};
        bayes.tokenCounts = json.tokenCounts || {};
        bayes.vocabulary = new Set(json.vocabulary || []);
        bayes.totalDocs = json.totalDocs || 0;
        return bayes;
    }
}

export default CustomBayes;
