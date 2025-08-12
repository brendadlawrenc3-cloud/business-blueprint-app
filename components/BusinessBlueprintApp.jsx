"use client";
import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Sparkles, Target, Users, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';

const BusinessBlueprintApp = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [blueprint, setBlueprint] = useState(null);
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    growthStage: '',
    teamSize: '',
    mainChallenges: [],
    quarterlyGoals: '',
    currentRevenue: '',
    targetRevenue: '',
    majorObstacles: '',
    leadershipStyle: '',
    resourceConstraints: ''
  });

  const steps = [
    { title: "Business Overview", icon: Target },
    { title: "Growth & Challenges", icon: TrendingUp },
    { title: "Goals & Leadership", icon: Users },
    { title: "Your Blueprint", icon: Sparkles }
  ];

  const growthStages = [
    "Startup (0-2 years)",
    "Early Growth (2-5 years)", 
    "Scaling (5-10 years)",
    "Mature (10+ years)"
  ];

  const challenges = [
    "Cash flow management",
    "Team building & hiring",
    "Marketing & customer acquisition",
    "Product development",
    "Operational efficiency",
    "Competition",
    "Technology & systems",
    "Strategic planning"
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChallengeToggle = (challenge) => {
    setFormData(prev => ({
      ...prev,
      mainChallenges: prev.mainChallenges.includes(challenge)
        ? prev.mainChallenges.filter(c => c !== challenge)
        : [...prev.mainChallenges, challenge]
    }));
  };

  const generateBlueprint = async () => {
    setIsGenerating(true);
    
    try {
      const prompt = `Create a comprehensive 90-day business blueprint for the following business:

Business Details:
- Company: ${formData.businessName}
- Industry: ${formData.industry}
- Growth Stage: ${formData.growthStage}
- Team Size: ${formData.teamSize}
- Current Revenue: ${formData.currentRevenue}
- Target Revenue: ${formData.targetRevenue}

Key Challenges: ${formData.mainChallenges.join(', ')}
Quarterly Goals: ${formData.quarterlyGoals}
Major Obstacles: ${formData.majorObstacles}
Leadership Style: ${formData.leadershipStyle}
Resource Constraints: ${formData.resourceConstraints}

IMPORTANT: Respond with ONLY valid JSON in this exact format. Do not include any text before or after the JSON. Do not wrap in markdown code blocks.

{
  "executiveSummary": "Brief overview of the strategic approach",
  "milestoneRoadmap": [
    {
      "period": "Days 1-30",
      "focus": "Foundation & Quick Wins",
      "objectives": ["objective1", "objective2", "objective3"],
      "keyMetrics": ["metric1", "metric2"]
    },
    {
      "period": "Days 31-60", 
      "focus": "Growth & Optimization",
      "objectives": ["objective1", "objective2", "objective3"],
      "keyMetrics": ["metric1", "metric2"]
    },
    {
      "period": "Days 61-90",
      "focus": "Scale & Systematize", 
      "objectives": ["objective1", "objective2", "objective3"],
      "keyMetrics": ["metric1", "metric2"]
    }
  ],
  "keyDecisions": [
    {
      "decision": "Decision title",
      "timeline": "When to decide",
      "impact": "Why it matters",
      "options": ["option1", "option2"]
    }
  ],
  "leadershipFocus": [
    {
      "area": "Focus area title",
      "description": "What to focus on and why",
      "actions": ["action1", "action2", "action3"]
    }
  ],
  "quickWinResources": [
    {
      "category": "Resource category",
      "resources": [
        {
          "name": "Resource name",
          "description": "What it does",
          "timeToImplement": "Implementation timeline"
        }
      ]
    }
  ],
  "criticalSuccessFactors": ["factor1", "factor2", "factor3"]
}

Make this highly specific and actionable for their business situation.`;

      console.log("Sending request to Claude API...");
      
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [
            { role: "user", content: prompt }
          ]
        })
      });

      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("API response received:", data);
      
      if (!data.content || !data.content[0] || !data.content[0].text) {
        throw new Error("Invalid response structure from API");
      }
      
      let responseText = data.content[0].text;
      console.log("Raw response text:", responseText);
      
      responseText = responseText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}');
      
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("No valid JSON found in response");
      }
      
      responseText = responseText.substring(jsonStart, jsonEnd + 1);
      console.log("Cleaned response text:", responseText);
      
      const blueprintData = JSON.parse(responseText);
      console.log("Parsed blueprint data:", blueprintData);
      
      setBlueprint(blueprintData);
      setCurrentStep(3);
      
    } catch (error) {
      console.error("Detailed error:", error);
      
      let errorMessage = "Error generating blueprint: ";
      if (error.message.includes("JSON")) {
        errorMessage += "Invalid response format from AI. Please try again.";
      } else if (error.message.includes("API request failed")) {
        errorMessage += "Connection error. Please check your internet and try again.";
      } else {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 2) {
      generateBlueprint();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.businessName && formData.industry && formData.growthStage && formData.teamSize;
      case 1:
        return formData.mainChallenges.length > 0 && formData.currentRevenue && formData.targetRevenue;
      case 2:
        return formData.quarterlyGoals && formData.leadershipStyle;
      default:
        return false;
    }
  };

  if (blueprint) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              90-Day Brilliance Business Blueprint
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Strategic Execution Plan</h1>
            <p className="text-gray-600">Tailored for {formData.businessName}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Executive Summary</h2>
            <p className="text-gray-700 leading-relaxed">{blueprint.executiveSummary}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">90-Day Milestone Roadmap</h2>
            <div className="space-y-6">
              {blueprint.milestoneRoadmap.map((milestone, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-6 pb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                      {milestone.period}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{milestone.focus}</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Objectives:</h4>
                      <ul className="space-y-1">
                        {milestone.objectives.map((obj, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Key Metrics:</h4>
                      <ul className="space-y-1">
                        {milestone.keyMetrics.map((metric, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700">
                            <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            {metric}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Key Decisions This Quarter</h2>
            <div className="space-y-4">
              {blueprint.keyDecisions.map((decision, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{decision.decision}</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Timeline: </span>
                      <span className="text-gray-600">{decision.timeline}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-700">Impact: </span>
                      <span className="text-gray-600">{decision.impact}</span>
                    </div>
                  </div>
                  {decision.options && (
                    <div className="mt-2">
                      <span className="font-medium text-gray-700 text-sm">Options: </span>
                      <span className="text-gray-600 text-sm">{decision.options.join(', ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Leadership Focus Areas</h2>
            <div className="space-y-4">
              {blueprint.leadershipFocus.map((focus, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{focus.area}</h3>
                  <p className="text-gray-700 mb-3">{focus.description}</p>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Action Steps:</h4>
                    <ul className="space-y-1">
                      {focus.actions.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700">
                          <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Win Resources</h2>
            <div className="space-y-6">
              {blueprint.quickWinResources.map((category, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-gray-900 mb-3">{category.category}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {category.resources.map((resource, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{resource.name}</h4>
                        <p className="text-gray-700 text-sm mb-2">{resource.description}</p>
                        <div className="text-xs text-blue-600 font-medium">
                          Implementation: {resource.timeToImplement}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Critical Success Factors</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {blueprint.criticalSuccessFactors.map((factor, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{factor}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Keep Your Blueprint Alive</h2>
            <p className="text-blue-100 mb-6">
              Get daily prompts and micro-actions that keep your 90-day plan on track with our Lite subscription.
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Upgrade to Lite - Daily Success Prompts
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            90-Day Brilliance Business Blueprint – $149
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Strategic Execution Plan</h1>
          <p className="text-gray-600">AI-generated roadmap tailored to your growth stage and business challenges</p>
        </div>

        <div className="flex items-center justify-between mb-8 bg-white rounded-lg p-4 shadow-lg">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={index} className={`flex items-center gap-2 ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isActive ? 'bg-blue-600 text-white' : 
                  isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="hidden sm:block">
                  <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block flex-1 h-0.5 mx-4 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {isGenerating ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Generating Your Blueprint</h3>
              <p className="text-gray-600">Our AI is crafting your personalized 90-day strategic plan...</p>
            </div>
          ) : (
            <>
              {currentStep === 0 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Overview</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your business name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Industry *</label>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., SaaS, E-commerce, Consulting, Manufacturing"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Growth Stage *</label>
                    <select
                      value={formData.growthStage}
                      onChange={(e) => handleInputChange('growthStage', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select growth stage</option>
                      {growthStages.map(stage => (
                        <option key={stage} value={stage}>{stage}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Team Size *</label>
                    <select
                      value={formData.teamSize}
                      onChange={(e) => handleInputChange('teamSize', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select team size</option>
                      <option value="Just me">Just me</option>
                      <option value="2-5 people">2-5 people</option>
                      <option value="6-20 people">6-20 people</option>
                      <option value="21-50 people">21-50 people</option>
                      <option value="51-100 people">51-100 people</option>
                      <option value="100+ people">100+ people</option>
                    </select>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Growth & Challenges</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Main Challenges (select all that apply) *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {challenges.map(challenge => (
                        <button
                          key={challenge}
                          type="button"
                          onClick={() => handleChallengeToggle(challenge)}
                          className={`text-left p-3 rounded-lg border transition-colors ${
                            formData.mainChallenges.includes(challenge)
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {challenge}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Quarterly Revenue *</label>
                      <select
                        value={formData.currentRevenue}
                        onChange={(e) => handleInputChange('currentRevenue', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select range</option>
                        <option value="$0-$25K">$0-$25K</option>
                        <option value="$25K-$100K">$25K-$100K</option>
                        <option value="$100K-$500K">$100K-$500K</option>
                        <option value="$500K-$1M">$500K-$1M</option>
                        <option value="$1M-$5M">$1M-$5M</option>
                        <option value="$5M+">$5M+</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Quarterly Revenue *</label>
                      <select
                        value={formData.targetRevenue}
                        onChange={(e) => handleInputChange('targetRevenue', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select range</option>
                        <option value="$25K-$100K">$25K-$100K</option>
                        <option value="$100K-$500K">$100K-$500K</option>
                        <option value="$500K-$1M">$500K-$1M</option>
                        <option value="$1M-$5M">$1M-$5M</option>
                        <option value="$5M-$10M">$5M-$10M</option>
                        <option value="$10M+">$10M+</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Major Obstacles</label>
                    <textarea
                      value={formData.majorObstacles}
                      onChange={(e) => handleInputChange('majorObstacles', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="What are the biggest obstacles preventing your growth?"
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Goals & Leadership</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Quarterly Goals * 
                      <span className="text-red-500 ml-1">Required</span>
                    </label>
                    <textarea
                      value={formData.quarterlyGoals}
                      onChange={(e) => handleInputChange('quarterlyGoals', e.target.value)}
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !formData.quarterlyGoals ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="What are your top 3-5 goals for this quarter? (e.g., Increase revenue by 25%, Launch new product line, Hire 3 new team members)"
                      required
                    />
                    {!formData.quarterlyGoals && (
                      <p className="text-red-500 text-sm mt-1">Please enter your quarterly goals</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Leadership Style *
                      <span className="text-red-500 ml-1">Required</span>
                    </label>
                    <select
                      value={formData.leadershipStyle}
                      onChange={(e) => handleInputChange('leadershipStyle', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !formData.leadershipStyle ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                    >
                      <option value="">Select your style</option>
                      <option value="Hands-on micromanager">Hands-on micromanager</option>
                      <option value="Delegating coach">Delegating coach</option>
                      <option value="Strategic visionary">Strategic visionary</option>
                      <option value="Collaborative facilitator">Collaborative facilitator</option>
                      <option value="Results-driven executor">Results-driven executor</option>
                    </select>
                    {!formData.leadershipStyle && (
                      <p className="text-red-500 text-sm mt-1">Please select your leadership style</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Resource Constraints (Optional)</label>
                    <textarea
                      value={formData.resourceConstraints}
                      onChange={(e) => handleInputChange('resourceConstraints', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Budget limitations, time constraints, team capacity issues, etc."
                    />
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Form Status:</h4>
                    <div className="text-sm space-y-1">
                      <div className={formData.quarterlyGoals ? 'text-green-600' : 'text-red-600'}>
                        {formData.quarterlyGoals ? '✓' : '✗'} Quarterly Goals: {formData.quarterlyGoals ? 'Complete' : 'Missing'}
                      </div>
                      <div className={formData.leadershipStyle ? 'text-green-600' : 'text-red-600'}>
                        {formData.leadershipStyle ? '✓' : '✗'} Leadership Style: {formData.leadershipStyle ? formData.leadershipStyle : 'Not selected'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {!isGenerating && (
            <div className="flex justify-between mt-8">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  currentStep === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  canProceed()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                title={!canProceed() ? 'Please complete all required fields' : ''}
              >
                {currentStep === 2 ? (canProceed() ? 'Generate Blueprint' : 'Complete Required Fields') : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessBlueprintApp;
