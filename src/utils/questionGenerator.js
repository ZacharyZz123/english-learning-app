/**
 * 题目生成器 - 从词库动态生成各类型练习题
 * 支持350+道不重复题目，相近选项生成，挑战模式
 */

import wordBank from '../data/word_bank.json'
import extendedBank from '../data/extended_bank.json'

// 随机打乱数组
const shuffleArray = (array) => {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// 根据规则生成相近选项（名词复数）
const getSimilarPluralOptions = (correctPlural, rule) => {
  const similarGroups = extendedBank.similarGroups.pluralEndings
  const options = [correctPlural]
  
  // 从同规则组中选择干扰项
  const sameRuleOptions = similarGroups[rule] || similarGroups.s
  const otherOptions = sameRuleOptions.filter(p => p !== correctPlural)
  
  // 添加同规则的选项
  if (otherOptions.length >= 2) {
    options.push(...shuffleArray(otherOptions).slice(0, 2))
  }
  
  // 添加不同规则的选项使选项更有挑战性
  const allRules = Object.keys(similarGroups)
  for (const r of shuffleArray(allRules)) {
    if (r !== rule && options.length < 4) {
      const ruleOptions = similarGroups[r].filter(p => !options.includes(p))
      if (ruleOptions.length > 0) {
        options.push(ruleOptions[0])
      }
    }
  }
  
  return shuffleArray(options).slice(0, 4)
}

// 根据规则生成相近选项（动词三单）
const getSimilarThirdPersonOptions = (correctForm, rule) => {
  const similarGroups = extendedBank.similarGroups.thirdPersonEndings
  const options = [correctForm]
  
  // 映射规则名称
  const ruleMap = { regular: 's', es: 'es', ies: 'ies' }
  const mappedRule = ruleMap[rule] || 's'
  
  const sameRuleOptions = similarGroups[mappedRule] || similarGroups.s
  const otherOptions = sameRuleOptions.filter(p => p !== correctForm)
  
  if (otherOptions.length >= 2) {
    options.push(...shuffleArray(otherOptions).slice(0, 2))
  }
  
  // 添加不同规则的选项
  const allRules = Object.keys(similarGroups)
  for (const r of shuffleArray(allRules)) {
    if (r !== mappedRule && options.length < 4) {
      const ruleOptions = similarGroups[r].filter(p => !options.includes(p))
      if (ruleOptions.length > 0) {
        options.push(ruleOptions[0])
      }
    }
  }
  
  return shuffleArray(options).slice(0, 4)
}

// 根据分类生成相近词汇选项
const getSimilarWordOptions = (correctWord, category) => {
  const similarWords = extendedBank.similarGroups.similarWords
  let candidateGroup = null
  
  // 查找正确词汇所属的分类
  for (const [groupName, words] of Object.entries(similarWords)) {
    if (words.includes(correctWord)) {
      candidateGroup = words
      break
    }
  }
  
  // 如果找不到分类，使用传入的category或随机选择
  if (!candidateGroup && category && similarWords[category]) {
    candidateGroup = similarWords[category]
  }
  
  if (!candidateGroup) {
    // 回退：从所有词汇中随机选择
    const allWords = wordBank.vocabulary.map(v => v.chinese)
    const filtered = allWords.filter(w => w !== correctWord)
    return shuffleArray([correctWord, ...shuffleArray(filtered).slice(0, 3)])
  }
  
  const otherOptions = candidateGroup.filter(w => w !== correctWord)
  const options = [correctWord, ...shuffleArray(otherOptions).slice(0, 3)]
  
  // 如果不够4个，从其他组补充
  if (options.length < 4) {
    for (const words of Object.values(similarWords)) {
      const more = words.filter(w => !options.includes(w))
      if (more.length > 0 && options.length < 4) {
        options.push(more[0])
      }
    }
  }
  
  return shuffleArray(options).slice(0, 4)
}

// 生成词汇翻译题（英译中）- 使用相近词选项
const generateVocabularyQuestions = (count, isChallenge = false) => {
  const questions = []
  const vocab = shuffleArray([...wordBank.vocabulary])
  
  for (let i = 0; i < Math.min(count, vocab.length); i++) {
    const word = vocab[i]
    
    if (isChallenge) {
      // 挑战模式：填空题
      questions.push({
        id: `vocab_challenge_${word.id}`,
        type: 'fillBlank',
        question: `"${word.chinese}" 用英语怎么说？`,
        answer: word.english.toLowerCase(),
        hint: generateHint(word.english),
        explanation: {
          title: "词汇解析",
          content: `${word.english} ${word.phonetic} - ${word.chinese}`,
          detail: `正确答案：${word.english}\n发音：${word.phonetic}`
        }
      })
    } else {
      // 选择题模式
      const options = getSimilarWordOptions(word.chinese, null)
      // 确保正确答案在选项中
      if (!options.includes(word.chinese)) {
        options[0] = word.chinese
      }
      
      questions.push({
        id: `vocab_${word.id}`,
        type: 'choice',
        question: `"${word.english}" 的中文意思是?`,
        phonetic: word.phonetic,
        options: shuffleArray(options),
        answer: shuffleArray(options).indexOf(word.chinese),
        correctAnswer: word.chinese,
        explanation: {
          title: "词汇解析",
          content: `${word.english} ${word.phonetic} - ${word.chinese}`,
          detail: `发音：${word.phonetic}\n词义：${word.chinese}\n\n记忆技巧：通过音标和词形帮助记忆`
        }
      })
      // 重新计算answer
      questions[questions.length - 1].answer = questions[questions.length - 1].options.indexOf(word.chinese)
    }
  }
  return questions
}

// 生成填空提示
const generateHint = (word) => {
  const chars = word.split('')
  const hideCount = Math.ceil(chars.length * 0.4) // 隐藏40%的字母
  const indices = []
  
  while (indices.length < hideCount) {
    const idx = Math.floor(Math.random() * chars.length)
    if (!indices.includes(idx)) {
      indices.push(idx)
    }
  }
  
  return chars.map((c, i) => indices.includes(i) ? '_' : c).join('')
}

// 生成冠词a/an题目
const generateArticleQuestions = (count, isChallenge = false) => {
  const questions = []
  
  // 使用扩展题库中的冠词题目
  const articleQuestions = extendedBank.grammarQuestions.articles
  
  for (let i = 0; i < Math.min(count, articleQuestions.length); i++) {
    const q = articleQuestions[i % articleQuestions.length]
    
    if (isChallenge) {
      questions.push({
        id: `article_challenge_${i}`,
        type: 'fillBlank',
        question: q.question.replace('___', '______'),
        answer: q.answer.toLowerCase(),
        hint: q.answer[0] + '_',
        explanation: {
          title: "冠词用法",
          content: `正确答案：${q.answer}`,
          detail: q.answer === 'an' 
            ? "规则：以元音音素开头的单词前用 an"
            : q.answer === 'a'
            ? "规则：以辅音音素开头的单词前用 a"
            : "规则：特指或唯一事物用 the"
        }
      })
    } else {
      const options = shuffleArray([...q.options])
      questions.push({
        id: `article_${i}`,
        type: 'choice',
        question: q.question,
        options: options,
        answer: options.indexOf(q.answer),
        correctAnswer: q.answer,
        explanation: {
          title: "冠词用法",
          content: `正确答案：${q.answer}`,
          detail: q.answer === 'an' 
            ? "规则：以元音音素开头的单词前用 an\n注意：判断依据是发音而非字母"
            : q.answer === 'a'
            ? "规则：以辅音音素开头的单词前用 a\n注意：判断依据是发音而非字母"
            : "规则：特指或唯一事物用 the"
        }
      })
    }
  }
  
  // 补充词汇相关的冠词题目
  const vocab = shuffleArray([...wordBank.vocabulary])
  for (let i = questions.length; i < count && i - articleQuestions.length < vocab.length; i++) {
    const word = vocab[i - articleQuestions.length]
    const correctArticle = word.vowelSound ? "an" : "a"
    
    if (isChallenge) {
      questions.push({
        id: `article_vocab_challenge_${word.id}`,
        type: 'fillBlank',
        question: `______ ${word.english} (填写a或an)`,
        answer: correctArticle,
        hint: correctArticle[0] + '_',
        explanation: {
          title: "冠词用法",
          content: `${correctArticle} ${word.english}`,
          detail: word.vowelSound 
            ? `规则：${word.english} 以元音音素开头，使用 "an"\n音标：${word.phonetic}`
            : `规则：${word.english} 以辅音音素开头，使用 "a"\n音标：${word.phonetic}`
        }
      })
    } else {
      const options = shuffleArray(["a", "an", "the", "不需要冠词"])
      questions.push({
        id: `article_vocab_${word.id}`,
        type: 'choice',
        question: `___ ${word.english}`,
        phonetic: word.phonetic,
        options: options,
        answer: options.indexOf(correctArticle),
        correctAnswer: correctArticle,
        explanation: {
          title: "冠词用法",
          content: `${correctArticle} ${word.english}`,
          detail: word.vowelSound 
            ? `规则：${word.english} 以元音音素开头，使用 "an"\n\n音标：${word.phonetic}\n首音：元音音素`
            : `规则：${word.english} 以辅音音素开头，使用 "a"\n\n音标：${word.phonetic}\n首音：辅音音素`
        }
      })
    }
  }
  
  return shuffleArray(questions).slice(0, count)
}

// 生成动词三单题目 - 使用相近选项
const generateThirdPersonQuestions = (count, isChallenge = false) => {
  const questions = []
  const verbs = shuffleArray([...wordBank.verbs])
  
  for (let i = 0; i < Math.min(count, verbs.length); i++) {
    const verb = verbs[i]
    
    let ruleExplanation = ""
    switch (verb.rule) {
      case "regular":
        ruleExplanation = `规则：大多数动词直接加-s\n\n${verb.base} → ${verb.thirdPerson}`
        break
      case "es":
        ruleExplanation = `规则：以s, x, ch, sh, o结尾的动词加-es\n\n${verb.base} → ${verb.thirdPerson}`
        break
      case "ies":
        ruleExplanation = `规则：以【辅音字母+y】结尾的动词，变y为i再加-es\n\n${verb.base} → ${verb.thirdPerson}`
        break
      case "irregular":
        ruleExplanation = `不规则变化：${verb.base} → ${verb.thirdPerson}\n\n需要特殊记忆`
        break
    }
    
    if (isChallenge) {
      questions.push({
        id: `third_challenge_${verb.id}`,
        type: 'fillBlank',
        question: `动词 "${verb.base}" 的第三人称单数形式是？`,
        answer: verb.thirdPerson.toLowerCase(),
        hint: generateHint(verb.thirdPerson),
        explanation: {
          title: "动词三单变化",
          content: `${verb.base} → ${verb.thirdPerson} (${verb.chinese})`,
          detail: ruleExplanation + `\n\n例句：He ${verb.thirdPerson} every day.\n他每天${verb.chinese}。`
        }
      })
    } else {
      // 使用相近选项
      const options = getSimilarThirdPersonOptions(verb.thirdPerson, verb.rule)
      
      questions.push({
        id: `third_${verb.id}`,
        type: 'choice',
        question: `动词 "${verb.base}" 的第三人称单数形式是?`,
        options: options,
        answer: options.indexOf(verb.thirdPerson),
        correctAnswer: verb.thirdPerson,
        explanation: {
          title: "动词三单变化",
          content: `${verb.base} → ${verb.thirdPerson} (${verb.chinese})`,
          detail: ruleExplanation + `\n\n例句：He ${verb.thirdPerson} every day.\n他每天${verb.chinese}。`
        }
      })
    }
  }
  
  // 添加句子填空题
  const templates = [...extendedBank.sentenceTemplates.short, ...extendedBank.sentenceTemplates.medium, ...extendedBank.sentenceTemplates.long]
  const verbTemplates = templates.filter(t => t.verb)
  
  for (let i = questions.length; i < count && i - verbs.length < verbTemplates.length; i++) {
    const template = verbTemplates[(i - verbs.length) % verbTemplates.length]
    const verb = verbs[Math.floor(Math.random() * verbs.length)]
    const sentence = template.template.replace('___', `(${verb.base})`)
    
    if (isChallenge) {
      questions.push({
        id: `third_sentence_challenge_${i}`,
        type: 'fillBlank',
        question: sentence,
        answer: verb.thirdPerson.toLowerCase(),
        hint: generateHint(verb.thirdPerson),
        explanation: {
          title: "动词三单变化",
          content: `${verb.base} → ${verb.thirdPerson}`,
          detail: `在第三人称单数主语后，动词要变化。\n${verb.base} → ${verb.thirdPerson}`
        }
      })
    } else {
      const options = getSimilarThirdPersonOptions(verb.thirdPerson, verb.rule)
      questions.push({
        id: `third_sentence_${i}`,
        type: 'choice',
        question: sentence,
        options: options,
        answer: options.indexOf(verb.thirdPerson),
        correctAnswer: verb.thirdPerson,
        explanation: {
          title: "动词三单变化",
          content: `${verb.base} → ${verb.thirdPerson}`,
          detail: `在第三人称单数主语后，动词要变化。\n正确形式：${verb.thirdPerson}`
        }
      })
    }
  }
  
  return shuffleArray(questions).slice(0, count)
}

// 生成名词复数题目 - 使用相近选项
const generatePluralQuestions = (count, isChallenge = false) => {
  const questions = []
  const nouns = shuffleArray([...wordBank.nouns])
  
  for (let i = 0; i < Math.min(count, nouns.length); i++) {
    const noun = nouns[i]
    
    let ruleExplanation = ""
    switch (noun.rule) {
      case "regular":
        ruleExplanation = `规则：大多数名词直接加-s\n\n${noun.singular} → ${noun.plural}`
        break
      case "es":
        ruleExplanation = `规则：以s, x, ch, sh结尾的名词加-es\n\n${noun.singular} → ${noun.plural}`
        break
      case "ies":
        ruleExplanation = `规则：以【辅音字母+y】结尾的名词，变y为i再加-es\n\n${noun.singular} → ${noun.plural}`
        break
      case "ves":
        ruleExplanation = `规则：以f或fe结尾的名词，变f/fe为v再加-es\n\n${noun.singular} → ${noun.plural}`
        break
      case "irregular":
        ruleExplanation = `不规则变化：${noun.singular} → ${noun.plural}\n\n需要特殊记忆`
        break
      case "same":
        ruleExplanation = `单复数同形：${noun.singular} → ${noun.plural}\n\n该词单复数形式相同`
        break
    }
    
    if (isChallenge) {
      questions.push({
        id: `plural_challenge_${noun.id}`,
        type: 'fillBlank',
        question: `名词 "${noun.singular}" 的复数形式是？`,
        answer: noun.plural.toLowerCase(),
        hint: generateHint(noun.plural),
        explanation: {
          title: "名词复数变化",
          content: `${noun.singular} → ${noun.plural} (${noun.chinese})`,
          detail: ruleExplanation
        }
      })
    } else {
      // 使用相近选项
      const options = getSimilarPluralOptions(noun.plural, noun.rule)
      
      questions.push({
        id: `plural_${noun.id}`,
        type: 'choice',
        question: `名词 "${noun.singular}" 的复数形式是?`,
        options: options,
        answer: options.indexOf(noun.plural),
        correctAnswer: noun.plural,
        explanation: {
          title: "名词复数变化",
          content: `${noun.singular} → ${noun.plural} (${noun.chinese})`,
          detail: ruleExplanation
        }
      })
    }
  }
  
  return shuffleArray(questions).slice(0, count)
}

// 生成人称代词题目
const generatePronounQuestions = (count, isChallenge = false) => {
  const questions = []
  const pronouns = wordBank.pronouns.subject
  const grammarQuestions = extendedBank.grammarQuestions.pronouns
  
  // 添加语法题库中的代词题
  for (let i = 0; i < grammarQuestions.length; i++) {
    const q = grammarQuestions[i]
    
    if (isChallenge) {
      questions.push({
        id: `pronoun_grammar_challenge_${i}`,
        type: 'fillBlank',
        question: q.question.replace('___', '______'),
        answer: q.answer.toLowerCase(),
        hint: q.answer[0] + '_' + (q.answer.length > 2 ? '_' : ''),
        explanation: {
          title: "人称代词",
          content: `正确答案：${q.answer}`,
          detail: `代词的正确使用取决于它在句中的位置。\n作主语用主格，作宾语用宾格。`
        }
      })
    } else {
      const options = shuffleArray([...q.options])
      questions.push({
        id: `pronoun_grammar_${i}`,
        type: 'choice',
        question: q.question,
        options: options,
        answer: options.indexOf(q.answer),
        correctAnswer: q.answer,
        explanation: {
          title: "人称代词",
          content: `正确答案：${q.answer}`,
          detail: `代词的正确使用取决于它在句中的位置。\n作主语用主格，作宾语用宾格。`
        }
      })
    }
  }
  
  // 添加基础代词转换题
  for (let i = 0; i < pronouns.length; i++) {
    const p = pronouns[i]
    const allObjects = pronouns.map(pr => pr.object)
    
    if (isChallenge) {
      questions.push({
        id: `pronoun_sub_challenge_${i}`,
        type: 'fillBlank',
        question: `主格 "${p.pronoun}" 对应的宾格是？`,
        answer: p.object.toLowerCase(),
        hint: p.object[0] + '_' + (p.object.length > 2 ? '_' : ''),
        explanation: {
          title: "人称代词转换",
          content: `${p.pronoun} (主格) → ${p.object} (宾格)`,
          detail: `人称代词：${p.chinese}\n\n主格（做主语）：${p.pronoun}\n宾格（做宾语）：${p.object}`
        }
      })
    } else {
      const options = shuffleArray([...allObjects])
      questions.push({
        id: `pronoun_sub_${i}`,
        type: 'choice',
        question: `主格 "${p.pronoun}" 对应的宾格是?`,
        options: options,
        answer: options.indexOf(p.object),
        correctAnswer: p.object,
        explanation: {
          title: "人称代词转换",
          content: `${p.pronoun} (主格) → ${p.object} (宾格)`,
          detail: `人称代词：${p.chinese}\n\n主格（做主语）：${p.pronoun}\n宾格（做宾语）：${p.object}`
        }
      })
    }
  }
  
  // 复制扩展到足够数量
  let result = [...questions]
  while (result.length < count) {
    result = result.concat(questions.map((q, idx) => ({
      ...q,
      id: `${q.id}_${Math.floor(result.length / questions.length)}`
    })))
  }
  
  return shuffleArray(result).slice(0, count)
}

// 生成句型结构题目
const generateSentenceQuestions = (count, isChallenge = false) => {
  const questions = []
  const sentences = [...wordBank.sentences, ...extendedBank.grammarQuestions.sentencePatterns]
  const types = ["SV", "SVC", "SVO"]
  
  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i]
    const pattern = s.type || s.pattern
    
    if (isChallenge) {
      questions.push({
        id: `sentence_challenge_${i}`,
        type: 'fillBlank',
        question: `"${s.sentence}" 的句型结构是？（填写SV/SVC/SVO）`,
        answer: pattern.toLowerCase(),
        hint: pattern[0] + '_' + (pattern.length > 2 ? '_' : ''),
        explanation: {
          title: "句型分析",
          content: `${s.sentence} → ${pattern}`,
          detail: `句子：${s.sentence}\n中文：${s.chinese}\n\n句型：${pattern}`
        }
      })
    } else {
      const options = shuffleArray([...types, "SVOO"])
      questions.push({
        id: `sentence_${i}`,
        type: 'choice',
        question: `"${s.sentence}" 的句型结构是?`,
        options: options,
        answer: options.indexOf(pattern),
        correctAnswer: pattern,
        explanation: {
          title: "句型分析",
          content: `${s.sentence} → ${pattern}`,
          detail: `句子：${s.sentence}\n中文：${s.chinese}\n\n句型：${pattern}\n• S = 主语 (Subject)\n• V = 谓语动词 (Verb)\n• C = 补语/表语 (Complement)\n• O = 宾语 (Object)`
        }
      })
    }
  }
  
  // 复制扩展
  let result = [...questions]
  while (result.length < count) {
    result = result.concat(questions.map((q, idx) => ({
      ...q,
      id: `${q.id}_${Math.floor(result.length / questions.length)}`
    })))
  }
  
  return shuffleArray(result).slice(0, count)
}

// 生成特殊疑问句题目
const generateQuestionWordQuestions = (count, isChallenge = false) => {
  const questions = []
  const questionWords = wordBank.questionWords
  const grammarQuestions = extendedBank.grammarQuestions.questionWords
  const allWords = questionWords.map(q => q.word)
  
  // 使用语法题库
  for (let i = 0; i < grammarQuestions.length; i++) {
    const qw = grammarQuestions[i]
    
    if (isChallenge) {
      questions.push({
        id: `qword_grammar_challenge_${i}`,
        type: 'fillBlank',
        question: qw.question.replace('___', '______'),
        answer: qw.answer.toLowerCase(),
        hint: qw.answer.slice(0, 2) + '_'.repeat(Math.max(0, qw.answer.length - 2)),
        explanation: {
          title: "特殊疑问词",
          content: `正确答案：${qw.answer}`,
          detail: `疑问词：${qw.answer}\n用法：${qw.context}`
        }
      })
    } else {
      const options = shuffleArray(["What", "Who", "Where", "When", "Why", "How", "Which", "Whose", "How many", "How much"].filter(w => w !== qw.answer).slice(0, 3).concat([qw.answer]))
      questions.push({
        id: `qword_grammar_${i}`,
        type: 'choice',
        question: qw.question,
        options: shuffleArray(options),
        answer: shuffleArray(options).indexOf(qw.answer),
        correctAnswer: qw.answer,
        explanation: {
          title: "特殊疑问词",
          content: `正确答案：${qw.answer}`,
          detail: `疑问词：${qw.answer}\n用法：${qw.context}`
        }
      })
      // 修正answer
      questions[questions.length - 1].answer = questions[questions.length - 1].options.indexOf(qw.answer)
    }
  }
  
  // 添加基础疑问词题
  for (let i = 0; i < questionWords.length; i++) {
    const qw = questionWords[i]
    
    if (isChallenge) {
      questions.push({
        id: `qword_usage_challenge_${i}`,
        type: 'fillBlank',
        question: `${qw.usage}，应该用哪个疑问词？`,
        answer: qw.word.toLowerCase(),
        hint: qw.word.slice(0, 2) + '_'.repeat(Math.max(0, qw.word.length - 2)),
        explanation: {
          title: "特殊疑问词",
          content: `${qw.word} - ${qw.usage}`,
          detail: `疑问词：${qw.word} (${qw.chinese})\n用法：${qw.usage}\n\n例句：${qw.example}`
        }
      })
    } else {
      const options = shuffleArray([...allWords])
      questions.push({
        id: `qword_usage_${i}`,
        type: 'choice',
        question: `${qw.usage}，应该用哪个疑问词?`,
        options: options,
        answer: options.indexOf(qw.word),
        correctAnswer: qw.word,
        explanation: {
          title: "特殊疑问词",
          content: `${qw.word} - ${qw.usage}`,
          detail: `疑问词：${qw.word} (${qw.chinese})\n用法：${qw.usage}\n\n例句：${qw.example}`
        }
      })
    }
  }
  
  // 复制扩展
  let result = [...questions]
  while (result.length < count) {
    result = result.concat(questions.map((q, idx) => ({
      ...q,
      id: `${q.id}_${Math.floor(result.length / questions.length)}`
    })))
  }
  
  return shuffleArray(result).slice(0, count)
}

// 生成音标题目（选择题模式，挑战模式不适用）
const generatePhonicsQuestions = (count, isChallenge = false) => {
  const questions = []
  const vocab = shuffleArray([...wordBank.vocabulary])
  const allPhonetics = wordBank.vocabulary.map(v => v.phonetic)
  const allEnglish = wordBank.vocabulary.map(v => v.english)
  
  // 根据音标选单词
  for (let i = 0; i < Math.min(count / 2, vocab.length); i++) {
    const word = vocab[i]
    
    // 音标题目不支持填空挑战模式，始终使用选择题
    const options = shuffleArray([word.english, ...shuffleArray(allEnglish.filter(e => e !== word.english)).slice(0, 3)])
    
    questions.push({
      id: `phonics_word_${word.id}`,
      type: 'choice',
      question: `音标 "${word.phonetic}" 对应的单词是?`,
      options: options,
      answer: options.indexOf(word.english),
      correctAnswer: word.english,
      explanation: {
        title: "音标匹配",
        content: `${word.phonetic} → ${word.english}`,
        detail: `音标：${word.phonetic}\n单词：${word.english}\n中文：${word.chinese}\n\n音标学习技巧：注意元音和辅音的发音规则`
      }
    })
  }
  
  // 根据单词选音标
  for (let i = 0; i < Math.min(count / 2, vocab.length); i++) {
    const word = vocab[i]
    const options = shuffleArray([word.phonetic, ...shuffleArray(allPhonetics.filter(p => p !== word.phonetic)).slice(0, 3)])
    
    questions.push({
      id: `phonics_sound_${word.id}`,
      type: 'choice',
      question: `单词 "${word.english}" 的音标是?`,
      options: options,
      answer: options.indexOf(word.phonetic),
      correctAnswer: word.phonetic,
      explanation: {
        title: "音标识别",
        content: `${word.english} → ${word.phonetic}`,
        detail: `单词：${word.english}\n音标：${word.phonetic}\n中文：${word.chinese}`
      }
    })
  }
  
  return shuffleArray(questions).slice(0, count)
}

// 主函数：根据类别生成题目
export const generateQuestions = (category, count, isChallenge = false) => {
  switch (category) {
    case 'vocabulary':
      return generateVocabularyQuestions(count, isChallenge)
    case 'article':
      return generateArticleQuestions(count, isChallenge)
    case 'thirdPerson':
      return generateThirdPersonQuestions(count, isChallenge)
    case 'plural':
      return generatePluralQuestions(count, isChallenge)
    case 'pronoun':
      return generatePronounQuestions(count, isChallenge)
    case 'sentence':
      return generateSentenceQuestions(count, isChallenge)
    case 'question':
      return generateQuestionWordQuestions(count, isChallenge)
    case 'phonics':
      // 音标题目不支持填空挑战模式
      return generatePhonicsQuestions(count, false)
    case 'comprehensive':
      // 综合练习：从所有类别中各取一些
      const perCategory = Math.ceil(count / 8)
      return shuffleArray([
        ...generateVocabularyQuestions(perCategory, isChallenge),
        ...generateArticleQuestions(perCategory, isChallenge),
        ...generateThirdPersonQuestions(perCategory, isChallenge),
        ...generatePluralQuestions(perCategory, isChallenge),
        ...generatePronounQuestions(perCategory, isChallenge),
        ...generateSentenceQuestions(perCategory, isChallenge),
        ...generateQuestionWordQuestions(perCategory, isChallenge),
        ...generatePhonicsQuestions(perCategory, false) // 音标始终选择题
      ]).slice(0, count)
    default:
      return generateVocabularyQuestions(count, isChallenge)
  }
}

// 获取词库统计信息
export const getWordBankStats = () => {
  return {
    vocabulary: wordBank.vocabulary.length,
    nouns: wordBank.nouns.length,
    verbs: wordBank.verbs.length,
    pronouns: wordBank.pronouns.subject.length * 2,
    sentences: wordBank.sentences.length,
    questionWords: wordBank.questionWords.length * 2,
    grammarQuestions: Object.values(extendedBank.grammarQuestions).flat().length
  }
}
