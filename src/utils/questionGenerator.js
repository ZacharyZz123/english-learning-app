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

// 基于单数形式生成相似的复数变体选项
const getSimilarPluralOptions = (correctPlural, rule, singular = '') => {
  const options = [correctPlural]
  
  // 如果有单数形式，基于它生成变体
  if (singular) {
    const baseWord = singular.toLowerCase()
    const possibleEndings = []
    
    // 生成各种可能的复数变体
    possibleEndings.push(baseWord + 's')        // 直接加s: field → fields
    possibleEndings.push(baseWord + 'es')       // 加es: field → fieldes
    possibleEndings.push(baseWord + 'ies')      // 加ies (错误形式): field → fieldies
    
    // 如果以y结尾，生成ies变体
    if (baseWord.endsWith('y')) {
      possibleEndings.push(baseWord.slice(0, -1) + 'ies')  // baby → babies
      possibleEndings.push(baseWord + 's')                  // baby → babys (错误)
    }
    
    // 如果以f/fe结尾，生成ves变体
    if (baseWord.endsWith('f')) {
      possibleEndings.push(baseWord.slice(0, -1) + 'ves')  // leaf → leaves
      possibleEndings.push(baseWord + 's')                  // leaf → leafs (错误)
    }
    if (baseWord.endsWith('fe')) {
      possibleEndings.push(baseWord.slice(0, -2) + 'ves')  // knife → knives
      possibleEndings.push(baseWord + 's')                  // knife → knifes (错误)
    }
    
    // 如果以s, x, ch, sh结尾，生成es变体
    if (baseWord.endsWith('s') || baseWord.endsWith('x') || 
        baseWord.endsWith('ch') || baseWord.endsWith('sh')) {
      possibleEndings.push(baseWord + 'es')
      possibleEndings.push(baseWord + 's')  // 错误形式
    }
    
    // 添加不在正确答案中的变体作为干扰项
    for (const ending of possibleEndings) {
      if (ending !== correctPlural && !options.includes(ending) && options.length < 4) {
        options.push(ending)
      }
    }
  }
  
  // 如果变体不够4个，从同规则的其他单词中补充
  if (options.length < 4) {
    const similarGroups = extendedBank.similarGroups.pluralEndings
    const sameRuleOptions = similarGroups[rule] || similarGroups.s || []
    const otherOptions = sameRuleOptions.filter(p => p !== correctPlural && !options.includes(p))
    
    for (const opt of shuffleArray(otherOptions)) {
      if (options.length < 4) {
        options.push(opt)
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
      // 使用相近选项 - 传入singular用于生成变体
      const options = getSimilarPluralOptions(noun.plural, noun.rule, noun.singular)
      
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

// 句型结构映射（英文→中文）
const sentencePatternMap = {
  "SV": "SV (主谓)",
  "SVC": "SVC (主系表)",
  "SVO": "SVO (主谓宾)",
  "SVOO": "SVOO (主谓双宾)"
}

// 获取句型的显示名称
const getPatternDisplayName = (pattern) => {
  return sentencePatternMap[pattern] || pattern
}

// 自动解析句子成分
const autoAnalyzeSentence = (sentence, pattern, chinese) => {
  // 移除句末标点
  const cleanSentence = sentence.replace(/[.!?。！？]$/, '').trim()
  const words = cleanSentence.split(' ')
  
  let analysis = {}
  
  // 常见系动词
  const linkingVerbs = ['is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 
                        'seems', 'seem', 'looks', 'look', 'tastes', 'taste', 
                        'smells', 'smell', 'sounds', 'sound', 'feels', 'feel',
                        'becomes', 'become', 'became', 'turns', 'turn', 'turned',
                        'gets', 'get', 'got', 'grows', 'grow', 'grew', 'remains', 'remain']
  
  if (pattern === 'SV') {
    // 主谓结构：主语 + 谓语
    const verbIndex = words.length - 1
    const subject = words.slice(0, verbIndex).join(' ')
    const verb = words[verbIndex]
    analysis.S = subject
    analysis.V = verb
  } else if (pattern === 'SVC') {
    // 主系表结构：主语 + 系动词 + 表语
    let verbIndex = words.findIndex(w => linkingVerbs.includes(w.toLowerCase()))
    if (verbIndex === -1) verbIndex = 1
    
    const subject = words.slice(0, verbIndex).join(' ')
    const verb = words[verbIndex]
    const complement = words.slice(verbIndex + 1).join(' ')
    
    analysis.S = subject
    analysis.V = verb
    analysis.C = complement
  } else if (pattern === 'SVO') {
    // 主谓宾结构：主语 + 谓语 + 宾语
    // 假设第一个词是主语，第二个词是谓语，其余是宾语
    let verbIndex = 1
    // 如果主语是多个词（如 The cat），找谓语位置
    if (words[0].toLowerCase() === 'the' || words[0].toLowerCase() === 'a' || words[0].toLowerCase() === 'an') {
      verbIndex = 2
    }
    
    const subject = words.slice(0, verbIndex).join(' ')
    const verb = words[verbIndex]
    const object = words.slice(verbIndex + 1).join(' ')
    
    analysis.S = subject
    analysis.V = verb
    analysis.O = object
  }
  
  return analysis
}

// 常用词汇翻译映射
const wordTranslations = {
  // 代词
  'I': '我', 'you': '你', 'he': '他', 'she': '她', 'it': '它', 'we': '我们', 'they': '他们',
  'The': '这个', 'A': '一个', 'An': '一个',
  // 常见名词
  'bird': '鸟', 'sun': '太阳', 'baby': '婴儿', 'dog': '狗', 'cat': '猫', 'flower': '花',
  'food': '食物', 'cake': '蛋糕', 'soup': '汤', 'sky': '天空', 'water': '水',
  'teacher': '老师', 'student': '学生', 'doctor': '医生', 'friends': '朋友',
  'books': '书', 'music': '音乐', 'football': '足球', 'basketball': '篮球',
  'apples': '苹果', 'movies': '电影', 'letters': '信', 'pictures': '画',
  'English': '英语', 'mice': '老鼠', 'TV': '电视',
  // 常见动词
  'is': '是', 'am': '是', 'are': '是', 'was': '是', 'were': '是',
  'sings': '唱歌', 'rises': '升起', 'cries': '哭泣', 'runs': '跑', 'sleeps': '睡觉',
  'smiles': '微笑', 'passes': '流逝', 'flows': '流动', 'fall': '落下', 'shine': '闪耀',
  'bark': '叫', 'swim': '游泳', 'fly': '飞',
  'tastes': '尝起来', 'looks': '看起来', 'smells': '闻起来', 'sounds': '听起来',
  'seems': '似乎', 'becomes': '成为', 'became': '成为', 'turned': '变成',
  'read': '读', 'reads': '读', 'love': '爱', 'loves': '爱',
  'play': '玩', 'plays': '玩', 'eat': '吃', 'eats': '吃',
  'watch': '看', 'watches': '看', 'write': '写', 'writes': '写',
  'drink': '喝', 'drinks': '喝', 'catch': '抓', 'catches': '抓',
  'learn': '学习', 'learns': '学习', 'draw': '画', 'draws': '画',
  // 常见形容词
  'happy': '开心的', 'beautiful': '美丽的', 'good': '好的', 'nice': '好的',
  'sweet': '甜的', 'tired': '累的', 'hot': '热的', 'dark': '暗的', 'honest': '诚实的'
}

// 翻译单词或短语
const translateWord = (word) => {
  if (!word) return ''
  
  // 先检查完整短语
  const lowerWord = word.toLowerCase()
  if (wordTranslations[word]) return wordTranslations[word]
  if (wordTranslations[lowerWord]) return wordTranslations[lowerWord]
  
  // 尝试翻译短语中的每个词
  const words = word.split(' ')
  if (words.length > 1) {
    const translated = words.map(w => {
      const t = wordTranslations[w] || wordTranslations[w.toLowerCase()]
      return t || ''
    }).filter(t => t).join('')
    if (translated) return translated
  }
  
  // 检查单词（去掉冠词）
  const withoutArticle = word.replace(/^(The|A|An)\s+/i, '')
  if (wordTranslations[withoutArticle]) return wordTranslations[withoutArticle]
  if (wordTranslations[withoutArticle.toLowerCase()]) return wordTranslations[withoutArticle.toLowerCase()]
  
  return ''
}

// 格式化成分显示（带中文翻译）
const formatComponent = (english, existingTranslation) => {
  if (!english) return ''
  
  // 如果已有翻译（来自预定义数据），直接使用
  if (existingTranslation && existingTranslation.includes('(')) {
    return existingTranslation
  }
  
  // 否则尝试自动翻译
  const chinese = translateWord(english)
  if (chinese) {
    return `${english} (${chinese})`
  }
  return english
}

// 生成句子成分分析文本
const generateSentenceAnalysis = (s, pattern) => {
  let analysis = s.analysis
  
  // 如果没有分析数据，自动生成
  if (!analysis) {
    analysis = autoAnalyzeSentence(s.sentence, pattern, s.chinese)
  }
  
  // 检查是否已有中文翻译
  const hasTranslation = analysis.S && analysis.S.includes('(')
  
  let analysisText = ""
  
  if (pattern === 'SV') {
    // 主谓结构
    analysisText += `【句子成分分析】\n\n`
    analysisText += `S 主语：句子的主体 → ${formatComponent(analysis.S)}\n`
    analysisText += `V 谓语动词：表示主语的动作或状态 → ${formatComponent(analysis.V)}\n\n`
    analysisText += `结构 = S (主语) + V (谓语动词)`
  } else if (pattern === 'SVC') {
    // 主系表结构
    analysisText += `【句子成分分析】\n\n`
    analysisText += `S 主语：句子的主体 → ${formatComponent(analysis.S)}\n`
    analysisText += `V 谓语动词 (系动词)：连接主语和后面的成分 → ${formatComponent(analysis.V)}\n`
    analysisText += `C 补足语 (表语)：由形容词、名词或介词短语充当，位于系动词之后 → ${formatComponent(analysis.C)}\n\n`
    analysisText += `结构 = S (主语) + V (系动词) + C (表语/主语补足语)`
  } else if (pattern === 'SVO') {
    // 主谓宾结构
    analysisText += `【句子成分分析】\n\n`
    analysisText += `S 主语：句子的主体 → ${formatComponent(analysis.S)}\n`
    analysisText += `V 谓语动词：表示主语的动作 → ${formatComponent(analysis.V)}\n`
    analysisText += `O 宾语：动作的承受者或对象 → ${formatComponent(analysis.O)}\n\n`
    analysisText += `结构 = S (主语) + V (谓语动词) + O (宾语)`
  } else if (pattern === 'SVOO') {
    // 主谓双宾结构
    analysisText += `【句子成分分析】\n\n`
    analysisText += `S 主语：句子的主体 → ${formatComponent(analysis.S)}\n`
    analysisText += `V 谓语动词：表示主语的动作 → ${formatComponent(analysis.V)}\n`
    analysisText += `O1 间接宾语：动作的接受者 → ${formatComponent(analysis.O1) || '(人)'}\n`
    analysisText += `O2 直接宾语：动作的对象 → ${formatComponent(analysis.O2) || '(物)'}\n\n`
    analysisText += `结构 = S (主语) + V (谓语动词) + O1 (间接宾语) + O2 (直接宾语)`
  } else {
    // 默认格式
    analysisText += `【句子成分分析】\n\n`
    if (analysis.S) analysisText += `S 主语：${formatComponent(analysis.S)}\n`
    if (analysis.V) analysisText += `V 谓语：${formatComponent(analysis.V)}\n`
    if (analysis.C) analysisText += `C 表语：${formatComponent(analysis.C)}\n`
    if (analysis.O) analysisText += `O 宾语：${formatComponent(analysis.O)}\n`
  }
  
  return analysisText
}

// 生成句型结构题目
const generateSentenceQuestions = (count, isChallenge = false) => {
  const questions = []
  const sentences = [...wordBank.sentences, ...extendedBank.grammarQuestions.sentencePatterns]
  const types = ["SV", "SVC", "SVO"]
  
  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i]
    const pattern = s.type || s.pattern
    const patternDisplay = getPatternDisplayName(pattern)
    const analysisText = generateSentenceAnalysis(s, pattern)
    
    if (isChallenge) {
      questions.push({
        id: `sentence_challenge_${i}`,
        type: 'fillBlank',
        question: `"${s.sentence}" 的句型结构是？（填写SV/SVC/SVO）`,
        answer: pattern.toLowerCase(),
        hint: pattern[0] + '_' + (pattern.length > 2 ? '_' : ''),
        explanation: {
          title: "句型分析",
          content: `${s.sentence} → ${patternDisplay}，${s.chinese}`,
          detail: `${analysisText}`
        }
      })
    } else {
      // 使用带中文的选项
      const optionsWithChinese = shuffleArray([...types, "SVOO"].map(t => getPatternDisplayName(t)))
      questions.push({
        id: `sentence_${i}`,
        type: 'choice',
        question: `"${s.sentence}" 的句型结构是?`,
        options: optionsWithChinese,
        answer: optionsWithChinese.indexOf(patternDisplay),
        correctAnswer: patternDisplay,
        explanation: {
          title: "句型分析",
          content: `${s.sentence} → ${patternDisplay}，${s.chinese}`,
          detail: `${analysisText}`
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

// 获取相似发音的单词（基于音标结构相似性）
const getSimilarPhoneticWords = (targetWord, allVocab, count = 3) => {
  const targetPhonetic = targetWord.phonetic
  const targetLength = targetWord.english.length
  
  // 计算音标相似度
  const getSimilarity = (phonetic1, phonetic2) => {
    // 提取主要元音
    const vowelPattern = /[aeiouæɑɒʌəɪʊeɛɔ]/gi
    const vowels1 = (phonetic1.match(vowelPattern) || []).join('')
    const vowels2 = (phonetic2.match(vowelPattern) || []).join('')
    
    // 比较音节数（通过元音数量估计）
    const syllables1 = vowels1.length
    const syllables2 = vowels2.length
    
    // 相似度计算
    let score = 0
    if (syllables1 === syllables2) score += 3
    if (Math.abs(syllables1 - syllables2) === 1) score += 1
    
    // 首音相似
    if (phonetic1[1] === phonetic2[1]) score += 2
    
    // 尾音相似
    const end1 = phonetic1.slice(-3, -1)
    const end2 = phonetic2.slice(-3, -1)
    if (end1 === end2) score += 2
    
    return score
  }
  
  // 按相似度排序
  const candidates = allVocab
    .filter(v => v.id !== targetWord.id)
    .map(v => ({
      word: v,
      similarity: getSimilarity(targetPhonetic, v.phonetic),
      lengthDiff: Math.abs(v.english.length - targetLength)
    }))
    .sort((a, b) => {
      // 优先选择相似度高的，其次选择长度相近的
      if (b.similarity !== a.similarity) return b.similarity - a.similarity
      return a.lengthDiff - b.lengthDiff
    })
  
  return candidates.slice(0, count).map(c => c.word)
}

// 获取相似音标（基于结构相似性）
const getSimilarPhonetics = (targetPhonetic, allVocab, excludeWord, count = 3) => {
  const getSimilarity = (p1, p2) => {
    // 音标长度相似
    let score = 0
    if (Math.abs(p1.length - p2.length) <= 2) score += 2
    
    // 首音相同
    if (p1.slice(1, 3) === p2.slice(1, 3)) score += 3
    
    // 尾音相同
    if (p1.slice(-3, -1) === p2.slice(-3, -1)) score += 3
    
    // 包含相同元音
    const vowelPattern = /[aeiouæɑɒʌəɪʊeɛɔ]/gi
    const vowels1 = new Set(p1.match(vowelPattern) || [])
    const vowels2 = new Set(p2.match(vowelPattern) || [])
    const commonVowels = [...vowels1].filter(v => vowels2.has(v)).length
    score += commonVowels
    
    return score
  }
  
  const candidates = allVocab
    .filter(v => v.english !== excludeWord && v.phonetic !== targetPhonetic)
    .map(v => ({
      phonetic: v.phonetic,
      similarity: getSimilarity(targetPhonetic, v.phonetic)
    }))
    .sort((a, b) => b.similarity - a.similarity)
  
  // 去重
  const seen = new Set([targetPhonetic])
  const result = []
  for (const c of candidates) {
    if (!seen.has(c.phonetic) && result.length < count) {
      seen.add(c.phonetic)
      result.push(c.phonetic)
    }
  }
  return result
}

// 生成音标题目（选择题模式，挑战模式不适用）
const generatePhonicsQuestions = (count, isChallenge = false) => {
  const questions = []
  const vocab = shuffleArray([...wordBank.vocabulary])
  const allVocab = wordBank.vocabulary

  // 根据音标选单词 - 使用相似发音的单词作为干扰项
  for (let i = 0; i < Math.min(count / 2, vocab.length); i++) {
    const word = vocab[i]
    
    // 获取发音相似的单词作为干扰项
    const similarWords = getSimilarPhoneticWords(word, allVocab, 3)
    const distractors = similarWords.map(w => w.english)
    const options = shuffleArray([word.english, ...distractors])
    
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
  
  // 根据单词选音标 - 使用相似音标作为干扰项
  for (let i = 0; i < Math.min(count / 2, vocab.length); i++) {
    const word = vocab[i]
    
    // 获取结构相似的音标作为干扰项
    const similarPhonetics = getSimilarPhonetics(word.phonetic, allVocab, word.english, 3)
    const options = shuffleArray([word.phonetic, ...similarPhonetics])
    
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
