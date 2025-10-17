import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

export function CategoryManager() {
  const [categories, setCategories] = useState([])
  const [expandedCategories, setExpandedCategories] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [subDialogOpen, setSubDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentCategory, setCurrentCategory] = useState(null)
  const [currentSubcategory, setCurrentSubcategory] = useState(null)
  const [categoryName, setCategoryName] = useState('')
  const [subcategoryName, setSubcategoryName] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (categoriesError) throw categoriesError

      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('subcategories')
        .select('*')
        .order('name')

      if (subcategoriesError) throw subcategoriesError

      const categoriesWithSubs = categoriesData.map(category => ({
        ...category,
        subcategories: subcategoriesData.filter(sub => sub.category_id === category.id)
      }))

      setCategories(categoriesWithSubs)
    } catch (error) {
      toast.error('Erro ao carregar categorias: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (categoryId) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      toast.error('O nome da categoria não pode estar vazio')
      return
    }

    try {
      const { error } = await supabase
        .from('categories')
        .insert([{ name: categoryName.trim() }])

      if (error) throw error

      toast.success('Categoria criada com sucesso!')
      setCategoryName('')
      setDialogOpen(false)
      fetchCategories()
    } catch (error) {
      toast.error('Erro ao criar categoria: ' + error.message)
    }
  }

  const handleUpdateCategory = async () => {
    if (!categoryName.trim()) {
      toast.error('O nome da categoria não pode estar vazio')
      return
    }

    try {
      const { error } = await supabase
        .from('categories')
        .update({ name: categoryName.trim() })
        .eq('id', currentCategory.id)

      if (error) throw error

      toast.success('Categoria atualizada com sucesso!')
      setCategoryName('')
      setDialogOpen(false)
      setEditMode(false)
      setCurrentCategory(null)
      fetchCategories()
    } catch (error) {
      toast.error('Erro ao atualizar categoria: ' + error.message)
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)

      if (error) throw error

      toast.success('Categoria excluída com sucesso!')
      fetchCategories()
    } catch (error) {
      toast.error('Erro ao excluir categoria: ' + error.message)
    }
  }

  const handleCreateSubcategory = async () => {
    if (!subcategoryName.trim()) {
      toast.error('O nome da subcategoria não pode estar vazio')
      return
    }

    if (!selectedCategoryId) {
      toast.error('Selecione uma categoria')
      return
    }

    try {
      const { error } = await supabase
        .from('subcategories')
        .insert([{ name: subcategoryName.trim(), category_id: selectedCategoryId }])

      if (error) throw error

      toast.success('Subcategoria criada com sucesso!')
      setSubcategoryName('')
      setSubDialogOpen(false)
      setSelectedCategoryId(null)
      fetchCategories()
    } catch (error) {
      toast.error('Erro ao criar subcategoria: ' + error.message)
    }
  }

  const handleUpdateSubcategory = async () => {
    if (!subcategoryName.trim()) {
      toast.error('O nome da subcategoria não pode estar vazio')
      return
    }

    try {
      const { error } = await supabase
        .from('subcategories')
        .update({ name: subcategoryName.trim() })
        .eq('id', currentSubcategory.id)

      if (error) throw error

      toast.success('Subcategoria atualizada com sucesso!')
      setSubcategoryName('')
      setSubDialogOpen(false)
      setEditMode(false)
      setCurrentSubcategory(null)
      fetchCategories()
    } catch (error) {
      toast.error('Erro ao atualizar subcategoria: ' + error.message)
    }
  }

  const handleDeleteSubcategory = async (subcategoryId) => {
    try {
      const { error } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', subcategoryId)

      if (error) throw error

      toast.success('Subcategoria excluída com sucesso!')
      fetchCategories()
    } catch (error) {
      toast.error('Erro ao excluir subcategoria: ' + error.message)
    }
  }

  const openCreateCategoryDialog = () => {
    setEditMode(false)
    setCurrentCategory(null)
    setCategoryName('')
    setDialogOpen(true)
  }

  const openEditCategoryDialog = (category) => {
    setEditMode(true)
    setCurrentCategory(category)
    setCategoryName(category.name)
    setDialogOpen(true)
  }

  const openCreateSubcategoryDialog = (categoryId) => {
    setEditMode(false)
    setCurrentSubcategory(null)
    setSubcategoryName('')
    setSelectedCategoryId(categoryId)
    setSubDialogOpen(true)
  }

  const openEditSubcategoryDialog = (subcategory) => {
    setEditMode(true)
    setCurrentSubcategory(subcategory)
    setSubcategoryName(subcategory.name)
    setSubDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F6EBD7] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Categorias</h1>
            <p className="text-gray-600 mt-2">Organize as categorias e subcategorias dos seus produtos</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="lg" 
                className="bg-black hover:bg-gray-800 text-white rounded-xl px-6 py-6 text-base"
                onClick={openCreateCategoryDialog}
              >
                <Plus className="mr-2 h-5 w-5" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {editMode ? 'Editar Categoria' : 'Nova Categoria'}
                </DialogTitle>
                <DialogDescription>
                  {editMode 
                    ? 'Atualize o nome da categoria abaixo.' 
                    : 'Digite o nome da nova categoria abaixo.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="category-name" className="text-base">
                    Nome da Categoria
                  </Label>
                  <Input
                    id="category-name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Ex: Adesivos Decorativos"
                    className="h-12 text-base rounded-xl"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                  className="rounded-xl h-12 px-6"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  onClick={editMode ? handleUpdateCategory : handleCreateCategory}
                  className="bg-black hover:bg-gray-800 text-white rounded-xl h-12 px-6"
                >
                  {editMode ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={subDialogOpen} onOpenChange={setSubDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-white rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {editMode ? 'Editar Subcategoria' : 'Nova Subcategoria'}
              </DialogTitle>
              <DialogDescription>
                {editMode 
                  ? 'Atualize o nome da subcategoria abaixo.' 
                  : 'Digite o nome da nova subcategoria abaixo.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="subcategory-name" className="text-base">
                  Nome da Subcategoria
                </Label>
                <Input
                  id="subcategory-name"
                  value={subcategoryName}
                  onChange={(e) => setSubcategoryName(e.target.value)}
                  placeholder="Ex: Adesivos de Parede"
                  className="h-12 text-base rounded-xl"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setSubDialogOpen(false)}
                className="rounded-xl h-12 px-6"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                onClick={editMode ? handleUpdateSubcategory : handleCreateSubcategory}
                className="bg-black hover:bg-gray-800 text-white rounded-xl h-12 px-6"
              >
                {editMode ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="space-y-4">
          {categories.length === 0 ? (
            <Card className="bg-white rounded-2xl border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-gray-500 text-lg mb-4">Nenhuma categoria cadastrada</p>
                <Button 
                  onClick={openCreateCategoryDialog}
                  className="bg-black hover:bg-gray-800 text-white rounded-xl px-6 py-6 text-base"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Criar Primeira Categoria
                </Button>
              </CardContent>
            </Card>
          ) : (
            categories.map((category) => (
              <Card key={category.id} className="bg-white rounded-2xl border-0 shadow-sm overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {expandedCategories.has(category.id) ? (
                          <ChevronDown className="h-5 w-5 text-gray-600" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-600" />
                        )}
                      </button>
                      <div className="flex-1">
                        <CardTitle className="text-xl font-semibold text-gray-900">
                          {category.name}
                        </CardTitle>
                        <CardDescription className="text-sm mt-1">
                          {category.subcategories.length} subcategoria(s)
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditCategoryDialog(category)}
                        className="h-10 w-10 rounded-lg hover:bg-gray-100"
                      >
                        <Edit2 className="h-4 w-4 text-gray-600" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-lg hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a categoria "{category.name}"? 
                              Esta ação não pode ser desfeita e todas as subcategorias associadas também serão excluídas.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl h-12">Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteCategory(category.id)}
                              className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button
                        size="sm"
                        onClick={() => openCreateSubcategoryDialog(category.id)}
                        className="bg-[#E7D1B0] hover:bg-[#d9c3a2] text-gray-900 rounded-lg px-4 h-10"
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Subcategoria
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {expandedCategories.has(category.id) && (
                  <CardContent className="pt-0">
                    {category.subcategories.length === 0 ? (
                      <div className="bg-gray-50 rounded-xl p-6 text-center">
                        <p className="text-gray-500 mb-3">Nenhuma subcategoria cadastrada</p>
                        <Button
                          size="sm"
                          onClick={() => openCreateSubcategoryDialog(category.id)}
                          className="bg-black hover:bg-gray-800 text-white rounded-lg px-4"
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          Adicionar Subcategoria
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {category.subcategories.map((subcategory) => (
                          <div
                            key={subcategory.id}
                            className="flex items-center justify-between bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                          >
                            <span className="text-base text-gray-900 font-medium">
                              {subcategory.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditSubcategoryDialog(subcategory)}
                                className="h-9 w-9 rounded-lg hover:bg-white"
                              >
                                <Edit2 className="h-4 w-4 text-gray-600" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-lg hover:bg-red-50 hover:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-white rounded-2xl">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir a subcategoria "{subcategory.name}"? 
                                      Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl h-12">Cancelar</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteSubcategory(subcategory.id)}
                                      className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

