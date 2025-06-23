import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet,
  Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { PanGestureHandler } from 'react-native-gesture-handler';

const logos = {
  BARCELOS: require('./assets/grupobarcelos.png'),
  RIVELLI: require('./assets/rivelli.png'),
  SULITA: require('./assets/sulita.png'),
};

const motivosPredefinidos = [
  'Fora de horário',
  'Pedido repetido',
  'Sem agendamento',
  'Mercadoria Avariada',
];

export default function App() {
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_700Bold });
  const [viewForm, setViewForm] = useState(false);
  const [tipoIndex, setTipoIndex] = useState(0);
  const tipos = ['Reentregas', 'Devoluções'];
  const tipo = tipos[tipoIndex];
  const [cliente, setCliente] = useState('');
  const [produtos, setProdutos] = useState([{ produto: '', quantidade: '', unidade: '', peso: '' }]);
  const [local, setLocal] = useState('');
  const [motivo, setMotivo] = useState('');
  const [mostrarDropdown, setMostrarDropdown] = useState(null); 
  const [data, setData] = useState('');
  const [notaFiscal, setNotaFiscal] = useState('');
  const [dados, setDados] = useState({ Reentregas: {}, Devoluções: {} });
  const [detalheSelecionado, setDetalheSelecionado] = useState(null);

  if (!fontsLoaded) return null;

  const formatarData = (texto) => {
    let v = texto.replace(/\D/g, '').slice(0, 8);
    if (v.length >= 5) return v.replace(/(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
    else if (v.length >= 3) return v.replace(/(\d{2})(\d{0,2})/, '$1/$2');
    else return v;
  };

  const registrar = () => {
    const clienteUpper = cliente.trim().toUpperCase();
    if (!clienteUpper || produtos.some(p => !p.produto || !p.quantidade || !p.unidade || !p.peso) || !local || !motivo || !data || !notaFiscal) return;
    const novaEntrada = { cliente: clienteUpper, produtos, local, motivo, data, notaFiscal };
    setDados(prev => {
      const atual = { ...prev };
      if (!atual[tipo][clienteUpper]) atual[tipo][clienteUpper] = [];
      atual[tipo][clienteUpper].push(novaEntrada);
      return atual;
    });
    setCliente('');
    setProdutos([{ produto: '', quantidade: '', unidade: '', peso: '' }]);
    setLocal('');
    setMotivo('');
    setMostrarDropdown(null);
    setData('');
    setNotaFiscal('');
    setViewForm(false);
  };

  const deletar = (tipo, cliente, index) => {
    setDados(prev => {
      const atual = { ...prev };
      atual[tipo][cliente].splice(index, 1);
      if (atual[tipo][cliente].length === 0) delete atual[tipo][cliente];
      return atual;
    });
  };

  const adicionarProduto = () => {
    setProdutos([...produtos, { produto: '', quantidade: '', unidade: '', peso: '' }]);
  };

  const atualizarProduto = (index, campo, valor) => {
    const novosProdutos = [...produtos];
    novosProdutos[index][campo] = valor;
    setProdutos(novosProdutos);
  };

  const mudarAba = (direcao) => {
    const novoIndex = tipoIndex + direcao;
    if (novoIndex >= 0 && novoIndex < tipos.length) {
      setTipoIndex(novoIndex);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('./assets/Espacologo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Reentrega e Devolução</Text>

      <View style={styles.tabs}>
        {tipos.map((op, i) => (
          <TouchableOpacity key={op} onPress={() => setTipoIndex(i)}>
            <Text style={[styles.tab, tipoIndex === i && styles.activeTab]}>{op}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {!viewForm && (
        <TouchableOpacity style={styles.addButton} onPress={() => setViewForm(true)}>
          <Text style={styles.addButtonText}>＋</Text>
        </TouchableOpacity>
      )}

      {viewForm && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.form}>
            <Text style={styles.label}>Cliente:</Text>
            <TouchableOpacity onPress={() => setMostrarDropdown(m => m === 'cliente' ? null : 'cliente')} style={styles.dropdown}>
              <Text style={styles.dropdownText}>{cliente || 'Selecionar cliente'}</Text>
            </TouchableOpacity>
            {mostrarDropdown === 'cliente' && (
              <View style={styles.dropdownOptions}>
                {Object.keys(logos).map(nome => (
                  <TouchableOpacity key={nome} onPress={() => {
                    setCliente(nome);
                    setMostrarDropdown(null);
                  }}>
                    <Text style={styles.dropdownItem}>{nome}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {produtos.map((p, i) => (
              <View key={i} style={{ marginBottom: 10 }}>
                <TextInput placeholder="Produto" placeholderTextColor="#aaa" style={styles.input} value={p.produto} onChangeText={val => atualizarProduto(i, 'produto', val)} />
                <View style={{ flexDirection: 'row', gap: 5 }}>
                  <TextInput placeholder="Qtd." placeholderTextColor="#aaa" style={[styles.input, { flex: 1 }]} keyboardType="numeric" value={p.quantidade} onChangeText={val => atualizarProduto(i, 'quantidade', val)} />
                  <TouchableOpacity
                    style={[styles.input, { flex: 1, justifyContent: 'center' }]}
                    onPress={() => {
                      const novaUnidade = p.unidade === 'cx' ? 'un' : 'cx';
                      atualizarProduto(i, 'unidade', novaUnidade);
                    }}
                  >
                    <Text style={{ color: '#fff', fontFamily: 'Poppins_400Regular', textAlign: 'center' }}>
                      {p.unidade || 'cx / un'}
                    </Text>
                  </TouchableOpacity>
                  <TextInput placeholder="Peso (Kg)" placeholderTextColor="#aaa" style={[styles.input, { flex: 1 }]} keyboardType="numeric" value={p.peso} onChangeText={val => atualizarProduto(i, 'peso', val)} />
                </View>
                {produtos.length > 1 && i > 0 && (
                  <TouchableOpacity onPress={() => {
                    const novos = produtos.filter((_, index) => index !== i);
                    setProdutos(novos);
                  }}>
                    <Text style={{ color: 'red', marginTop: 5 }}>🗑 Remover produto</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <TouchableOpacity onPress={adicionarProduto}>
              <Text style={{ color: '#00BFFF', marginBottom: 10 }}>+ Adicionar outro produto</Text>
            </TouchableOpacity>

            <TextInput placeholder="Local" placeholderTextColor="#aaa" style={styles.input} value={local} onChangeText={setLocal} />
            <TextInput placeholder="Data da Devolução (DD/MM/AAAA)" placeholderTextColor="#aaa" style={styles.input} value={data} onChangeText={text => setData(formatarData(text))} />
            <TextInput placeholder="Número da Nota Fiscal" placeholderTextColor="#aaa" style={styles.input} value={notaFiscal} onChangeText={setNotaFiscal} />

            <Text style={styles.label}>Motivo:</Text>
            <TouchableOpacity onPress={() => setMostrarDropdown(m => m === 'motivo' ? null : 'motivo')} style={styles.dropdown}>
              <Text style={styles.dropdownText}>{motivo || 'Selecionar motivo'}</Text>
            </TouchableOpacity>
            {mostrarDropdown === 'motivo' && (
              <View style={styles.dropdownOptions}>
                {motivosPredefinidos.map((op) => (
                  <TouchableOpacity key={op} onPress={() => { setMotivo(op); setMostrarDropdown(null); }}>
                    <Text style={styles.dropdownItem}>{op}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.button} onPress={registrar}>
              <Text style={styles.buttonText}>Registrar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setViewForm(false)}>
              <Text style={styles.voltar}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      <PanGestureHandler onGestureEvent={({ nativeEvent }) => {
        if (nativeEvent.translationX > 50) mudarAba(-1);
        else if (nativeEvent.translationX < -50) mudarAba(1);
      }}>
        <ScrollView style={styles.list}>
          {Object.entries(dados[tipo]).map(([nomeCliente, registros]) => (
            <View key={nomeCliente} style={styles.clienteGrupo}>
              <View style={styles.clienteHeader}>
                <Image source={logos[nomeCliente]} style={styles.logoPequena} resizeMode="contain" />
                <Text style={styles.clienteNome}>{nomeCliente}</Text>
              </View>
              {registros.map((item, index) => (
                <TouchableOpacity key={index} style={styles.item} onPress={() => setDetalheSelecionado({ ...item, tipo, cliente: nomeCliente, index })}>
                  {item.produtos.map((prod, i) => (
                    <Text key={i} style={styles.itemText}>📦 {prod.produto} - {prod.quantidade} {prod.unidade}</Text>
                  ))}
                  <Text style={styles.subItemText}>📍 {item.local}</Text>
                  <Text style={styles.subItemText}>🧾 {item.notaFiscal}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      </PanGestureHandler>

      <Modal visible={!!detalheSelecionado} transparent animationType="slide">
        <View style={styles.modal}>
          {detalheSelecionado && (
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Detalhes</Text>
              <Text style={styles.modalInfo}>Cliente: {detalheSelecionado.cliente}</Text>
              {detalheSelecionado.produtos.map((prod, i) => (
                <View key={i}>
                  <Text style={styles.modalInfo}>Produto: {prod.produto}</Text>
                  <Text style={styles.modalInfo}>Qtd: {prod.quantidade} {prod.unidade}</Text>
                  <Text style={styles.modalInfo}>Peso: {prod.peso} Kg</Text>
                </View>
              ))}
              <Text style={styles.modalInfo}>Local: {detalheSelecionado.local}</Text>
              <Text style={styles.modalInfo}>Motivo: {detalheSelecionado.motivo}</Text>
              <Text style={styles.modalInfo}>Data: {detalheSelecionado.data}</Text>
              <Text style={styles.modalInfo}>Nota Fiscal: {detalheSelecionado.notaFiscal}</Text>
              <TouchableOpacity onPress={() => {
                deletar(detalheSelecionado.tipo, detalheSelecionado.cliente, detalheSelecionado.index);
                setDetalheSelecionado(null);
              }}>
                <Text style={styles.delete}>🗑️ Deletar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setDetalheSelecionado(null)}>
                <Text style={styles.voltar}>Voltar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 20 },
  logo: { width: 120, height: 60, alignSelf: 'center', marginBottom: 10 },
  title: { fontSize: 24, fontFamily: 'Poppins_700Bold', color: '#00BFFF', textAlign: 'center', marginBottom: 10 },
  tabs: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  tab: { marginHorizontal: 20, fontSize: 16, color: '#aaa', fontFamily: 'Poppins_400Regular' },
  activeTab: { color: '#00BFFF', textDecorationLine: 'underline' },
  addButton: { alignSelf: 'flex-end', marginBottom: 10, padding: 10 },
  addButtonText: { fontSize: 28, color: '#00BFFF' },
  form: { backgroundColor: '#222', padding: 15, borderRadius: 10, marginBottom: 15 },
  input: { backgroundColor: '#333', color: '#fff', padding: 10, borderRadius: 8, marginBottom: 10, fontFamily: 'Poppins_400Regular' },
  button: { backgroundColor: '#00BFFF', padding: 12, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontFamily: 'Poppins_700Bold' },
  voltar: { color: '#aaa', marginTop: 10, textAlign: 'center' },
  list: { flex: 1 },
  clienteGrupo: { marginBottom: 20 },
  clienteHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  clienteNome: { color: '#fff', fontSize: 18, fontFamily: 'Poppins_700Bold', marginLeft: 10 },
  logoPequena: { width: 30, height: 30 },
  item: { backgroundColor: '#333', padding: 10, borderRadius: 8, marginBottom: 5 },
  itemText: { color: '#fff', fontSize: 14 },
  subItemText: { color: '#aaa', fontSize: 12 },
  modal: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#222', padding: 20, borderRadius: 10, width: '90%' },
  modalTitle: { fontSize: 20, color: '#00BFFF', fontFamily: 'Poppins_700Bold', marginBottom: 10, textAlign: 'center' },
  modalInfo: { fontSize: 16, color: '#fff', fontFamily: 'Poppins_400Regular', marginVertical: 2 },
  delete: { color: 'red', marginTop: 10, textAlign: 'center' },
  label: { color: '#aaa', marginBottom: 5 },
  dropdown: { backgroundColor: '#333', padding: 10, borderRadius: 8, marginBottom: 10 },
  dropdownText: { color: '#fff', fontFamily: 'Poppins_400Regular' },
  dropdownOptions: { backgroundColor: '#222', borderRadius: 8, marginBottom: 10, paddingVertical: 5 },
  dropdownItem: { paddingVertical: 8, paddingHorizontal: 10, color: '#00BFFF', fontFamily: 'Poppins_400Regular' },
});
