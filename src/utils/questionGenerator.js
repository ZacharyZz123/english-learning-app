/**
 * 题目生成器 - 从词库动态生成各类型练习题
 * 支持350+道不重复题目
 */

import wordBank from '../data/word_bank.json'

// 随机打乱数组
const shuffleArray = (array) => {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// 生成干扰选项（从同类词汇中选取）
const generateDistractors = (correctAnswer, allOptions, count = 3) => {
  const filtered = allOptions.filter(opt => opt !== correctAnswer)
  return shuffleArray(filtered).slice(0, count)
}

// 生成词汇翻译题（英译中）
const generateVocabularyQuestions = (count) => {
  const questions = []
  const vocab = shuffleArray([...wordBank.vocabulary])
  const allChinese = wordBank.vocabulary.map(v => v.chinese)
  
  for (let i = 0; i < Math.min(count, vocab.length); i++) {
    const word = vocab[i]
    const distractors = generateDistractors(word.chinese, allChinese)
    const options = shuffleArray([word.chinese, ...distractors])
    
    questions.push({
      id: `vocab_${word.id}`,
      question: `"${word.english}" 的中文意思是?`,
      phonetic: word.phonetic,
      options: options,
      answer: options.indexOf(word.chinese),
      explanation: {
        title: "词汇解析",
        content: `${word.english} ${word.phonetic} - ${word.chinese}`,
        detail: `发音：${word.phonetic}\n词义：${word.chinese}\n\n记忆技巧：通过音标和词形帮助记忆`
      }
    })
  }
  return questions
}

// 生成冠词a/an题目
const generateArticleQuestions = (count) => {
  const questions = []
  const vocab = shuffleArray([...wordBank.vocabulary])
  
  for (let i = 0; i < Math.min(count, vocab.length); i++) {
    const word = vocab[i]
    const correctArticle = word.vowelSound ? "an" : "a"
    const options = shuffleArray(["a", "an", "the", "不需要冠词"])
    
    questions.push({
      id: `article_${word.id}`,
      question: `___ ${word.english}`,
      phonetic: word.phonetic,
      options: options,
      answer: options.indexOf(correctArticle),
      explanation: {
        title: "冠词用法",
        content: `${correctArticle} ${word.english}`,
        detail: word.vowelSound 
          ? `规则：${word.english} 以元音音素开头，使用 "an"\n\n音标：${word.phonetic}\n首音：元音音素`
          : `规则：${word.english} 以辅音音素开头，使用 "a"\n\n音标：${word.phonetic}\n首音：辅音音素`
      }
    })
  }
  return questions
}

// 生成动词三单题目
const generateThirdPersonQuestions = (count) => {
  const questions = []
  const verbs = shuffleArray([...wordBank.verbs])
  const allThirdPerson = wordBank.verbs.map(v => v.thirdPerson)
  
  for (let i = 0; i < Math.min(count, verbs.length); i++) {
    const verb = verbs[i]
    const distractors = generateDistractors(verb.thirdPerson, allThirdPerson)
    const options = shuffleArray([verb.thirdPerson, ...distractors])
    
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
    
    questions.push({
      id: `third_${verb.id}`,
      question: `动词 "${verb.base}" 的第三人称单数形式是?`,
      options: options,
      answer: options.indexOf(verb.thirdPerson),
      explanation: {
        title: "动词三单变化",
        content: `${verb.base} → ${verb.thirdPerson} (${verb.chinese})`,
        detail: ruleExplanation + `\n\n例句：He ${verb.thirdPerson} every day.\n他每天${verb.chinese}。`
      }
    })
  }
  return questions
}

// 生成名词复数题目
const generatePluralQuestions = (count) => {
  const questions = []
  const nouns = shuffleArray([...wordBank.nouns])
  const allPlurals = wordBank.nouns.map(n => n.plural)
  
  for (let i = 0; i < Math.min(count, nouns.length); i++) {
    const noun = nouns[i]
    const distractors = generateDistractors(noun.plural, allPlurals)
    const options = shuffleArray([noun.plural, ...distractors])
    
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
    
    questions.push({
      id: `plural_${noun.id}`,
      question: `名词 "${noun.singular}" 的复数形式是?`,
      options: options,
      answer: options.indexOf(noun.plural),
      explanation: {
        title: "名词复数变化",
        content: `${noun.singular} → ${noun.plural} (${noun.chinese})`,
        detail: ruleExplanation
      }
    })
  }
  return questions
}

// 生成人称代词题目
const generatePronounQuestions = (count) => {
  const questions = []
  const pronouns = wordBank.pronouns.subject
  
  // 生成主格到宾格的题目
  for (let i = 0; i < pronouns.length; i++) {
    const p = pronouns[i]
    const allObjects = pronouns.map(pr => pr.object)
    const distractors = generateDistractors(p.object, allObjects)
    const options = shuffleArray([p.object, ...distractors])
    
    questions.push({
      id: `pronoun_sub_${i}`,
      question: `主格 "${p.pronoun}" 对应的宾格是?`,
      options: options,
      answer: options.indexOf(p.object),
      explanation: {
        title: "人称代词转换",
        content: `${p.pronoun} (主格) → ${p.object} (宾格)`,
        detail: `人称代词：${p.chinese}\n\n主格（做主语）：${p.pronoun}\n宾格（做宾语）：${p.object}\n\n例句：${p.pronoun} see him. → He sees ${p.object}.`
      }
    })
  }
  
  // 生成宾格到主格的题目
  for (let i = 0; i < pronouns.length; i++) {
    const p = pronouns[i]
    const allSubjects = pronouns.map(pr => pr.pronoun)
    const distractors = generateDistractors(p.pronoun, allSubjects)
    const options = shuffleArray([p.pronoun, ...distractors])
    
    questions.push({
      id: `pronoun_obj_${i}`,
      question: `宾格 "${p.object}" 对应的主格是?`,
      options: options,
      answer: options.indexOf(p.pronoun),
      explanation: {
        title: "人称代词转换",
        content: `${p.object} (宾格) → ${p.pronoun} (主格)`,
        detail: `人称代词：${p.chinese}\n\n宾格（做宾语）：${p.object}\n主格（做主语）：${p.pronoun}`
      }
    })
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
const generateSentenceQuestions = (count) => {
  const questions = []
  const sentences = wordBank.sentences
  const types = ["SV", "SVC", "SVO"]
  
  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i]
    const options = shuffleArray([...types, "SVOO"])
    
    questions.push({
      id: `sentence_${i}`,
      question: `"${s.sentence}" 的句型结构是?`,
      options: options,
      answer: options.indexOf(s.type),
      explanation: {
        title: "句型分析",
        content: `${s.sentence} → ${s.type}`,
        detail: `句子：${s.sentence}\n中文：${s.chinese}\n\n句型：${s.type}\n• S = 主语 (Subject)\n• V = 谓语动词 (Verb)\n• C = 补语/表语 (Complement)\n• O = 宾语 (Object)`
      }
    })
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
const generateQuestionWordQuestions = (count) => {
  const questions = []
  const questionWords = wordBank.questionWords
  const allWords = questionWords.map(q => q.word)
  
  // 根据用法选择疑问词
  for (let i = 0; i < questionWords.length; i++) {
    const qw = questionWords[i]
    const distractors = generateDistractors(qw.word, allWords)
    const options = shuffleArray([qw.word, ...distractors])
    
    questions.push({
      id: `qword_usage_${i}`,
      question: `${qw.usage}，应该用哪个疑问词?`,
      options: options,
      answer: options.indexOf(qw.word),
      explanation: {
        title: "特殊疑问词",
        content: `${qw.word} - ${qw.usage}`,
        detail: `疑问词：${qw.word} (${qw.chinese})\n用法：${qw.usage}\n\n例句：${qw.example}`
      }
    })
  }
  
  // 根据例句选择疑问词
  for (let i = 0; i < questionWords.length; i++) {
    const qw = questionWords[i]
    const distractors = generateDistractors(qw.word, allWords)
    const options = shuffleArray([qw.word, ...distractors])
    
    questions.push({
      id: `qword_example_${i}`,
      question: `"___ is this?" 横线处应填?`,
      options: options,
      answer: options.indexOf(qw.word),
      explanation: {
        title: "特殊疑问句",
        content: `${qw.word} is this?`,
        detail: `疑问词：${qw.word}\n中文：${qw.chinese}\n用法：${qw.usage}`
      }
    })
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

// 生成音标题目（与词汇共享）
const generatePhonicsQuestions = (count) => {
  const questions = []
  const vocab = shuffleArray([...wordBank.vocabulary])
  const allPhonetics = wordBank.vocabulary.map(v => v.phonetic)
  
  // 根据音标选单词
  for (let i = 0; i < Math.min(count / 2, vocab.length); i++) {
    const word = vocab[i]
    const allEnglish = wordBank.vocabulary.map(v => v.english)
    const distractors = generateDistractors(word.english, allEnglish)
    const options = shuffleArray([word.english, ...distractors])
    
    questions.push({
      id: `phonics_word_${word.id}`,
      question: `音标 "${word.phonetic}" 对应的单词是?`,
      options: options,
      answer: options.indexOf(word.english),
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
    const distractors = generateDistractors(word.phonetic, allPhonetics)
    const options = shuffleArray([word.phonetic, ...distractors])
    
    questions.push({
      id: `phonics_sound_${word.id}`,
      question: `单词 "${word.english}" 的音标是?`,
      options: options,
      answer: options.indexOf(word.phonetic),
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
export const generateQuestions = (category, count) => {
  switch (category) {
    case 'vocabulary':
      return generateVocabularyQuestions(count)
    case 'article':
      return generateArticleQuestions(count)
    case 'thirdPerson':
      return generateThirdPersonQuestions(count)
    case 'plural':
      return generatePluralQuestions(count)
    case 'pronoun':
      return generatePronounQuestions(count)
    case 'sentence':
      return generateSentenceQuestions(count)
    case 'question':
      return generateQuestionWordQuestions(count)
    case 'phonics':
      return generatePhonicsQuestions(count)
    case 'comprehensive':
      // 综合练习：从所有类别中各取一些
      const perCategory = Math.ceil(count / 8)
      return shuffleArray([
        ...generateVocabularyQuestions(perCategory),
        ...generateArticleQuestions(perCategory),
        ...generateThirdPersonQuestions(perCategory),
        ...generatePluralQuestions(perCategory),
        ...generatePronounQuestions(perCategory),
        ...generateSentenceQuestions(perCategory),
        ...generateQuestionWordQuestions(perCategory),
        ...generatePhonicsQuestions(perCategory)
      ]).slice(0, count)
    default:
      return generateVocabularyQuestions(count)
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
    questionWords: wordBank.questionWords.length * 2
  }
}
